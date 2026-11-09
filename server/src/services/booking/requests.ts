import { normalizePhone, type BookingData } from '@future/shared';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { config } from '../../config.js';
import { ApiError } from '../../lib/api-error.js';
import { hash } from '../../lib/crypto.js';
import { tokenFor } from '../../lib/tracking-tokens.js';
import { Appointment, type AppointmentRecord } from '../../models/appointment.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { publicAppointment } from '../../presenters/appointment.js';
import { minutes, slotPolicy } from './policy.js';
import { expirePending, reserve } from './reservations.js';

async function generateAppointmentReference(session?: mongoose.ClientSession): Promise<string> {
  // Generate clean, memorable numeric codes (e.g. 3002, 1250, 4820) as requested by clinic patients
  for (let i = 0; i < 15; i++) {
    const num = crypto.randomInt(1001, 9999);
    const ref = String(num);
    const exists = await Appointment.exists({
      $or: [{ reference: ref }, { reference: `FC-${ref}` }],
    }).session(session || null);
    if (!exists) return ref;
  }
  // Fallback to 5-digit number if 4-digit space has collisions
  for (let i = 0; i < 10; i++) {
    const num = crypto.randomInt(10001, 99999);
    const ref = String(num);
    const exists = await Appointment.exists({
      $or: [{ reference: ref }, { reference: `FC-${ref}` }],
    }).session(session || null);
    if (!exists) return ref;
  }
  return String(crypto.randomInt(100000, 999999));
}

export async function createBooking(
  data: BookingData,
  idempotencyKey: string,
  userId?: string,
  options?: { bypassPatientDailyLimit?: boolean },
) {
  await expirePending();
  const keyHash = hash(idempotencyKey);
  const payloadHash = hash(JSON.stringify({ data, userId: userId || null }));
  const existing = async () =>
    Appointment.findOne({ idempotencyHash: keyHash })
      .select('+idempotencyHash +payloadHash +phone')
      .lean();
  const replay = (previousAppointment: AppointmentRecord) => {
    if (previousAppointment.payloadHash !== payloadHash)
      throw new ApiError(
        409,
        'IDEMPOTENCY_MISMATCH',
        'تغيّرت بيانات الطلب. أعيدي إرساله مرة واحدة.',
      );
    return {
      appointment: publicAppointment(previousAppointment),
      trackingToken: tokenFor(previousAppointment._id.toString(), keyHash),
      replayed: true,
    };
  };
  const prior = await existing();
  if (prior) return replay(prior);
  const id = new mongoose.Types.ObjectId();
  const token = tokenFor(id.toString(), keyHash);
  let result: AppointmentRecord | undefined;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // This write serializes booking and schedule edits, avoiding a schedule/booking write-skew.
      const clinic = await Clinic.findOneAndUpdate(
        { key: 'main' },
        { $inc: { revision: 1 } },
        { returnDocument: 'after', session },
      ).lean();
      const service = await ServiceModel.findOne({ id: data.serviceId }).session(session).lean();
      if (!clinic || !service || service.active === false)
        throw new ApiError(404, 'SERVICE_NOT_FOUND', 'الخدمة غير متاحة.');
      const already = await Appointment.findOne({ idempotencyHash: keyHash })
        .select('+idempotencyHash +payloadHash +phone')
        .session(session)
        .lean();
      if (already) {
        result = already;
        return;
      }

      // Enforce: Only ONE active appointment per patient per day
      if (!options?.bypassPatientDailyLimit) {
        const patientCriteria: Record<string, unknown>[] = [];
        if (userId) {
          patientCriteria.push({ userId: new mongoose.Types.ObjectId(userId) });
        }
        if (data.phone) {
          const normPhone = normalizePhone(data.phone);
          patientCriteria.push({ phone: normPhone });
          patientCriteria.push({ phone: data.phone });
        }

        if (patientCriteria.length > 0) {
          const existingSameDay = await Appointment.findOne({
            date: data.date,
            status: { $in: ['pending', 'confirmed'] },
            $or: patientCriteria,
          })
            .session(session)
            .select('+phone reference time status date serviceTitle')
            .lean();

          if (existingSameDay) {
            const statusLabel =
              existingSameDay.status === 'confirmed' ? 'مؤكد' : 'قيد المراجعة والاعتماد';
            throw new ApiError(
              409,
              'PATIENT_ALREADY_BOOKED_FOR_DAY',
              `لديك بالفعل حجز مسجل في هذا اليوم (${data.date}) الساعة ${existingSameDay.time} (كود الحجز: ${existingSameDay.reference} - ${statusLabel}). لا يُسمح بنظام العيادة بحجز أكثر من موعد لنفس المريض في اليوم الواحد لإتاحة الفرصة للجميع. يمكنك متابعة أو تعديل موعدك الحالي أو اختيار يوم آخر.`,
            );
          }
        }
      }

      // Enforce: Daily Capacity Limit
      if (clinic.dailyLimit?.enabled) {
        const dObj = DateTime.fromISO(data.date, { zone: clinic.timezone || 'Africa/Cairo' });
        const weekdayKey = String(dObj.weekday);
        const dateLimit =
          clinic.dailyLimit.dateOverrides instanceof Map
            ? clinic.dailyLimit.dateOverrides.get(data.date)
            : clinic.dailyLimit.dateOverrides?.[data.date];
        const weekLimit =
          clinic.dailyLimit.weekdayLimits instanceof Map
            ? clinic.dailyLimit.weekdayLimits.get(weekdayKey)
            : clinic.dailyLimit.weekdayLimits?.[weekdayKey];
        const dayLimit = Number(dateLimit) || Number(weekLimit) || clinic.dailyLimit.maxPatients || 12;

        const currentBooked = await Appointment.countDocuments({
          date: data.date,
          status: { $in: ['pending', 'confirmed', 'completed'] },
        }).session(session);

        if (currentBooked >= dayLimit) {
          throw new ApiError(
            409,
            'DAILY_CAPACITY_REACHED',
            clinic.dailyLimit.closedMessage ||
              'عفواً، اكتمل الحد الأقصى للحجوزات لهذا اليوم لضمان أعلى جودة رعاية لكل مريض. يُرجى اختيار موعد في يوم آخر.',
          );
        }
      }

      const policy = slotPolicy(clinic, data.date, data.time, service.duration);
      if (!policy.ok)
        throw new ApiError(409, 'SLOT_UNAVAILABLE', 'هذا الوقت غير متاح. اختاري وقتًا آخر.');
      const start = minutes(data.time);
      const end = start + service.duration;
      await reserve(id, data.date, start, end, session);
      const reference = await generateAppointmentReference(session);
      const [createdAppointment] = await Appointment.create(
        [
          {
            _id: id,
            reference,
            userId: userId ? new mongoose.Types.ObjectId(userId) : null,
            idempotencyHash: keyHash,
            payloadHash,
            tokenHash: hash(token),
            serviceId: service.id,
            serviceTitle: service.title,
            duration: service.duration,
            price: service.price,
            name: data.name,
            phone: data.phone,
            whatsapp: data.whatsapp || data.phone,
            date: data.date,
            time: data.time,
            startMinute: start,
            endMinute: end,
            status: 'pending',
            holdUntil: new Date(
              Math.min(
                Date.now() + config.PENDING_HOLD_HOURS * 3600000,
                DateTime.fromISO(`${data.date}T${data.time}`, { zone: clinic.timezone }).toMillis(),
              ),
            ),
            history: [
              {
                status: 'pending',
                at: new Date(),
                message: 'تم استلام طلب الموعد، بانتظار موافقة المركز.',
                actor: userId ? 'patient' : 'guest',
              },
            ],
            reschedule: null,
          },
        ],
        { session },
      );
      result = createdAppointment.toObject();
    });
  } catch (e) {
    const prior = await existing();
    if (prior) return replay(prior);
    if ((e as { code?: number }).code === 11000)
      throw new ApiError(
        409,
        'SLOT_UNAVAILABLE',
        'هذا الوقت أصبح محجوزًا. احتفظنا ببياناتك؛ اختاري وقتًا آخر.',
      );
    throw e;
  } finally {
    await session.endSession();
  }
  if (!result) throw new Error('Booking transaction returned no record');
  return {
    appointment: publicAppointment(result),
    trackingToken: result._id.equals(id) ? token : tokenFor(result._id.toString(), keyHash),
    replayed: !result._id.equals(id),
  };
}

export async function findByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token))
    throw new ApiError(404, 'NOT_FOUND', 'رابط المتابعة غير صحيح أو لم يعد متاحًا.');
  const appointment = await Appointment.findOne({ tokenHash: hash(token) })
    .select('+phone')
    .lean();
  if (!appointment)
    throw new ApiError(404, 'NOT_FOUND', 'رابط المتابعة غير صحيح أو لم يعد متاحًا.');
  return appointment;
}
