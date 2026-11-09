import type { Availability } from '@future/shared';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import { ApiError } from '../../lib/api-error.js';
import { Appointment, type AppointmentRecord } from '../../models/appointment.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { Reservation } from '../../models/reservation.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { cells, minutes, slotPolicy, timeString } from './policy.js';
import { expirePending } from './reservations.js';

export async function availability(
  serviceId: string,
  date: string,
  snapshotDuration?: number,
  ignoreAppointment?: string,
): Promise<Availability> {
  await expirePending();
  const [clinic, service] = await Promise.all([
    Clinic.findOne({ key: 'main' }).lean(),
    ServiceModel.findOne({ id: serviceId }).lean(),
  ]);
  if (!clinic || !service) throw new ApiError(404, 'NOT_FOUND', 'الخدمة غير متاحة.');
  const duration = snapshotDuration ?? service.duration;
  const day = DateTime.fromISO(date, { zone: clinic.timezone });
  if (!day.isValid) throw new ApiError(400, 'INVALID_DATE', 'اختاري يومًا صحيحًا.');
  const today = DateTime.now().setZone(clinic.timezone).startOf('day');
  if (day < today || day > today.plus({ days: 90 }))
    throw new ApiError(400, 'INVALID_DATE', 'اختاري يومًا خلال التسعين يومًا القادمة.');
  const hours = clinic.hours.find((h) => h.weekday === day.weekday);
  if (!hours?.open)
    return {
      date,
      serviceId,
      timezone: clinic.timezone,
      slots: [],
      closed: true,
      message: 'المركز مغلق في هذا اليوم. اختاري يومًا آخر.',
    };

  // Check Daily Capacity Limit (الحد الأقصى لحجوزات اليوم)
  let dailyCapacityInfo: Availability['dailyCapacity'] = undefined;
  if (clinic.dailyLimit?.enabled) {
    const weekdayKey = String(day.weekday);
    const dateLimit =
      clinic.dailyLimit.dateOverrides instanceof Map
        ? clinic.dailyLimit.dateOverrides.get(date)
        : clinic.dailyLimit.dateOverrides?.[date];
    const weekdayLimit =
      clinic.dailyLimit.weekdayLimits?.[weekdayKey] ??
      (clinic.dailyLimit.weekdayLimits instanceof Map
        ? clinic.dailyLimit.weekdayLimits.get(weekdayKey)
        : undefined);
    const limitForDay = Number(dateLimit) || Number(weekdayLimit) || clinic.dailyLimit.maxPatients || 12;

    const bookedCount = await Appointment.countDocuments({
      date,
      status: { $in: ['pending', 'confirmed', 'completed'] },
      ...(ignoreAppointment
        ? { _id: { $ne: new mongoose.Types.ObjectId(ignoreAppointment) } }
        : {}),
    });

    const isFull = bookedCount >= limitForDay;
    const showToPatients = clinic.dailyLimit.showToPatients !== false;

    dailyCapacityInfo = {
      limit: limitForDay,
      remaining: Math.max(0, limitForDay - bookedCount),
      bookedCount,
      isFull,
      showToPatients,
    };

    if (isFull) {
      return {
        date,
        serviceId,
        timezone: clinic.timezone,
        slots: [],
        closed: true,
        message:
          clinic.dailyLimit.closedMessage ||
          'عفواً، اكتمل الحد الأقصى للحجوزات لهذا اليوم لضمان أعلى جودة رعاية لكل مريض. يُرجى اختيار موعد في يوم آخر.',
        dailyCapacity: dailyCapacityInfo,
      };
    }
  }
  const locks = await Reservation.find({
    provider: 'main',
    date,
    ...(ignoreAppointment
      ? { appointmentId: { $ne: new mongoose.Types.ObjectId(ignoreAppointment) } }
      : {}),
  }).lean();
  const occupied = new Set(locks.map((l) => l.minute));
  const slots: Availability['slots'] = [];
  for (let start = minutes(hours.start); start + duration <= minutes(hours.end); start += 30) {
    const time = timeString(start);
    const policy = slotPolicy(clinic, date, time, duration);
    const busy = policy.ok && cells(start, start + duration).some((m) => occupied.has(m));
    slots.push({ time, available: policy.ok && !busy, reason: busy ? 'booked' : policy.reason });
  }
  return {
    date,
    serviceId,
    timezone: clinic.timezone,
    slots,
    closed: false,
    message: slots.some((s) => s.available)
      ? 'اختاري وقتًا متاحًا.'
      : 'لا توجد أوقات متاحة في هذا اليوم. اختاري يومًا آخر.',
    dailyCapacity: dailyCapacityInfo,
  };
}

export async function appointmentAvailability(a: AppointmentRecord, date: string) {
  const result = await availability(a.serviceId, date, a.duration, String(a._id));
  if (date === a.date)
    result.slots = result.slots.map((s) =>
      s.time === a.time ? { ...s, available: false, reason: 'blocked' as const } : s,
    );
  return result;
}
