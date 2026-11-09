import mongoose from 'mongoose';
import { ApiError } from '../../lib/api-error.js';
import { Appointment } from '../../models/appointment.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { Reservation } from '../../models/reservation.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { publicAppointment } from '../../presenters/appointment.js';
import { minutes, slotPolicy } from './policy.js';
import { findByToken } from './requests.js';
import { expirePending } from './reservations.js';

export async function cancelByToken(token: string) {
  await expirePending();
  const appointment = await findByToken(token);
  if (!publicAppointment(appointment).canCancel)
    throw new ApiError(409, 'INVALID_STATE', 'لا يمكن إلغاء موعد سابق أو غير نشط.');
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updateResult = await Appointment.updateOne(
        { _id: appointment._id, status: { $in: ['pending', 'confirmed'] } },
        {
          $set: { status: 'cancelled', holdUntil: null, reschedule: null },
          $push: {
            history: {
              status: 'cancelled',
              at: new Date(),
              message: 'تم إلغاء الموعد بناءً على طلبك.',
              actor: 'guest',
            },
          },
        },
        { session },
      );
      if (!updateResult.modifiedCount)
        throw new ApiError(409, 'INVALID_STATE', 'لا يمكن إلغاء هذا الموعد بحالته الحالية.');
      await Reservation.deleteMany({ appointmentId: appointment._id }, { session });
    });
  } finally {
    await session.endSession();
  }
  return publicAppointment(await findByToken(token));
}

export async function requestReschedule(token: string, date: string, time: string) {
  await expirePending();
  const appointment = await findByToken(token);
  if (!publicAppointment(appointment).canReschedule)
    throw new ApiError(409, 'INVALID_STATE', 'لا يمكن تغيير موعد سابق أو غير نشط.');
  const service = await ServiceModel.findOne({ id: appointment.serviceId }).lean();
  const clinic = await Clinic.findOne({ key: 'main' }).lean();
  if (!service || !clinic || !slotPolicy(clinic, date, time, appointment.duration).ok)
    throw new ApiError(409, 'SLOT_UNAVAILABLE', 'الوقت المقترح غير متاح.');
  if (date === appointment.date && time === appointment.time)
    throw new ApiError(400, 'SAME_SLOT', 'اختاري وقتًا مختلفًا عن موعدك الحالي.');
  const start = minutes(time);
  const locks = await Reservation.exists({
    date,
    provider: 'main',
    minute: { $gte: start, $lt: start + appointment.duration },
    appointmentId: { $ne: appointment._id },
  });
  if (locks) throw new ApiError(409, 'SLOT_UNAVAILABLE', 'الوقت المقترح أصبح محجوزًا.');
  const updated = await Appointment.findOneAndUpdate(
    { _id: appointment._id, status: { $in: ['pending', 'confirmed'] } },
    {
      $set: { reschedule: { date, time, requestedAt: new Date() } },
      $push: {
        history: {
          status: appointment.status,
          at: new Date(),
          message: 'تم إرسال طلب تغيير الموعد. الموعد الحالي قائم حتى الاعتماد.',
          actor: 'guest',
        },
      },
    },
    { returnDocument: 'after' },
  )
    .select('+phone')
    .lean();
  if (!updated)
    throw new ApiError(409, 'INVALID_STATE', 'لا يمكن تغيير هذا الموعد بحالته الحالية.');
  return publicAppointment(updated);
}
