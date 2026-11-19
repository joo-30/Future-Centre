import { dateSchema, type ClinicAnalytics } from '@future/shared';
import { Router } from 'express';
import { DateTime } from 'luxon';
import { ApiError } from '../../lib/api-error.js';
import { Appointment } from '../../models/appointment.model.js';
import { Clinic, type ClinicRecord } from '../../models/clinic.model.js';
import { SubscriptionModel } from '../../models/subscription.model.js';
import { minutes } from '../../services/booking/policy.js';

export const router = Router();

function scheduledMinutes(clinic: ClinicRecord, date: DateTime, iso: string) {
  const hours = clinic.hours.find((day) => day.weekday === date.weekday);
  if (!hours?.open) return 0;
  const start = minutes(hours.start);
  const end = minutes(hours.end);
  const closures = [...hours.breaks, ...clinic.blocks.filter((block) => block.date === iso)]
    .map((block) => ({
      start: Math.max(start, minutes(block.start)),
      end: Math.min(end, minutes(block.end)),
    }))
    .filter((block) => block.start < block.end)
    .sort((a, b) => a.start - b.start);
  let available = end - start;
  let cursor = start;
  for (const block of closures) {
    available -= Math.max(0, block.end - Math.max(cursor, block.start));
    cursor = Math.max(cursor, block.end);
  }
  return Math.max(0, available);
}

router.get('/analytics', async (req, res) => {
  const clinic = await Clinic.findOne({ key: 'main' }).lean();
  if (!clinic) throw new ApiError(404, 'CLINIC_NOT_FOUND', 'إعدادات العيادة غير متاحة.');

  const today = DateTime.now().setZone(clinic.timezone).startOf('day');
  const chosen =
    req.query.date === undefined
      ? today
      : DateTime.fromISO(dateSchema.parse(req.query.date), { zone: clinic.timezone });
  const date = chosen.toISODate();
  if (!date) throw new ApiError(400, 'INVALID_DATE', 'اختاري يومًا صحيحًا.');

  const start = chosen.minus({ days: (chosen.weekday + 1) % 7 });
  const end = start.plus({ days: 6 });
  const weekStart = start.toISODate()!;
  const weekEnd = end.toISODate()!;
  const receivedDuring = (first: DateTime, last: DateTime) =>
    Appointment.countDocuments({
      createdAt: { $gte: first.toJSDate(), $lt: last.plus({ days: 1 }).toJSDate() },
    });

  const [appointments, receivedDay, receivedWeek, subscriptionsStarted, subscriptionsActive] =
    await Promise.all([
      Appointment.find({ date: { $gte: weekStart, $lte: weekEnd } })
        .select('date serviceId serviceTitle duration status -_id')
        .lean(),
      receivedDuring(chosen, chosen),
      receivedDuring(start, end),
      SubscriptionModel.countDocuments({
        startDate: { $gte: weekStart, $lte: weekEnd },
        status: { $nin: ['pending', 'cancelled'] },
      }),
      SubscriptionModel.countDocuments({
        status: 'active',
        startDate: { $lte: today.toISODate() },
        endDate: { $gte: today.toISODate() },
      }),
    ]);

  const dayAppointments = appointments.filter((appointment) => appointment.date === date);
  const completed = dayAppointments.filter((appointment) => appointment.status === 'completed');
  const counts = new Map<string, ClinicAnalytics['day']['services'][number]>();
  for (const appointment of dayAppointments) {
    const id = appointment.serviceId;
    const entry = counts.get(id) ?? {
      id,
      title: appointment.serviceTitle,
      booked: 0,
      completed: 0,
    };
    entry.booked++;
    if (appointment.status === 'completed') entry.completed++;
    counts.set(id, entry);
  }

  const result: ClinicAnalytics = {
    date,
    today: today.toISODate()!,
    weekStart,
    weekEnd,
    timezone: clinic.timezone,
    demoSchedule: clinic.demoSchedule,
    day: {
      received: receivedDay,
      booked: dayAppointments.length,
      completed: completed.length,
      pending: dayAppointments.filter((appointment) => appointment.status === 'pending').length,
      confirmed: dayAppointments.filter((appointment) => appointment.status === 'confirmed').length,
      noShow: dayAppointments.filter((appointment) => appointment.status === 'no_show').length,
      services: [...counts.values()].sort(
        (a, b) => b.completed - a.completed || b.booked - a.booked,
      ),
    },
    week: {
      received: receivedWeek,
      subscriptionsStarted,
      subscriptionsActive,
      days: Array.from({ length: 7 }, (_, index) => {
        const day = start.plus({ days: index });
        const iso = day.toISODate()!;
        const visits = appointments.filter(
          (appointment) => appointment.date === iso && appointment.status === 'completed',
        );
        return {
          date: iso,
          scheduledMinutes: scheduledMinutes(clinic, day, iso),
          completed: visits.length,
          visitMinutes: visits.reduce((sum, appointment) => sum + (appointment.duration || 0), 0),
        };
      }),
    },
  };
  res.json(result);
});
