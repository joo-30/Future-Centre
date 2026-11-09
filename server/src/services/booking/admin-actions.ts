import type { AppointmentStatus } from '@future/shared';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import { ApiError } from '../../lib/api-error.js';
import { Appointment, type AppointmentRecord } from '../../models/appointment.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { Reservation } from '../../models/reservation.model.js';
import { publicAppointment } from '../../presenters/appointment.js';
import { minutes, slotPolicy } from './policy.js';
import { expirePending, reserve } from './reservations.js';

export async function adminDecision(
  reference: string,
  action: string,
  reason = '',
  newDate?: string,
  newTime?: string,
) {
  await expirePending();
  let result: AppointmentRecord | undefined;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const clinic = await Clinic.findOneAndUpdate(
        { key: 'main' },
        { $inc: { revision: 1 } },
        { returnDocument: 'after', session },
      ).lean();
      const appointment = await Appointment.findOne({ reference })
        .select('+phone')
        .session(session);
      if (!clinic || !appointment) throw new ApiError(404, 'NOT_FOUND', 'الطلب غير موجود.');
      let message = '';
      let status: AppointmentStatus = appointment.status;
      if (action === 'approve') {
        if (appointment.status !== 'pending')
          throw new ApiError(409, 'INVALID_STATE', 'يمكن تأكيد الطلبات الجديدة فقط.');
        if (
          DateTime.fromISO(`${appointment.date}T${appointment.time}`, { zone: clinic.timezone }) <=
          DateTime.now()
        )
          throw new ApiError(409, 'PAST_APPOINTMENT', 'لا يمكن تأكيد موعد مضى.');
        status = 'confirmed';
        message = 'أكد المركز موعدك.';
      } else if (action === 'reject') {
        if (appointment.status !== 'pending')
          throw new ApiError(409, 'INVALID_STATE', 'لا يمكن رفض الطلب بحالته الحالية.');
        status = 'rejected';
        message = reason || 'تعذر تأكيد الوقت المطلوب. تواصلي مع المركز لاختيار بديل.';
      } else if (action === 'cancel') {
        if (!['pending', 'confirmed'].includes(appointment.status))
          throw new ApiError(409, 'INVALID_STATE', 'هذا الموعد غير نشط.');
        status = 'cancelled';
        message = reason || 'ألغى المركز الموعد.';
      } else if (action === 'complete' || action === 'no_show') {
        if (appointment.status !== 'confirmed')
          throw new ApiError(409, 'INVALID_STATE', 'يجب تأكيد الموعد أولًا.');
        const end = DateTime.fromISO(`${appointment.date}T${appointment.time}`, {
          zone: clinic.timezone,
        }).plus({
          minutes: appointment.duration,
        });
        if (end > DateTime.now())
          throw new ApiError(409, 'VISIT_NOT_FINISHED', 'لم ينته وقت الزيارة بعد.');
        status = action === 'complete' ? 'completed' : 'no_show';
        message = action === 'complete' ? 'تم تسجيل الزيارة كمكتملة.' : 'سجل المركز عدم الحضور.';
      } else if (action === 'decline_change') {
        if (!['pending', 'confirmed'].includes(appointment.status) || !appointment.reschedule)
          throw new ApiError(409, 'INVALID_STATE', 'لا يوجد طلب تغيير قائم.');
        appointment.reschedule = null;
        appointment.history.push({
          status: appointment.status,
          at: new Date(),
          message: reason || 'تعذر اعتماد تغيير الوقت. موعدك الأصلي ما زال قائمًا.',
          actor: 'admin',
        });
        await appointment.save({ session });
        result = appointment.toObject();
        return;
      } else if (action === 'reschedule') {
        if (!['pending', 'confirmed'].includes(appointment.status))
          throw new ApiError(409, 'INVALID_STATE', 'لا يمكن تغيير موعد غير نشط.');
        const date = newDate || appointment.reschedule?.date;
        const time = newTime || appointment.reschedule?.time;
        if (!date || !time || !slotPolicy(clinic, date, time, appointment.duration).ok)
          throw new ApiError(409, 'SLOT_UNAVAILABLE', 'الوقت الجديد غير متاح.');
        await Reservation.deleteMany({ appointmentId: appointment._id }, { session });
        await reserve(
          appointment._id,
          date,
          minutes(time),
          minutes(time) + appointment.duration,
          session,
        );
        appointment.date = date;
        appointment.time = time;
        appointment.startMinute = minutes(time);
        appointment.endMinute = appointment.startMinute + appointment.duration;
        status = 'confirmed';
        message = 'اعتمد المركز تغيير موعدك وأكد الوقت الجديد.';
      } else throw new ApiError(400, 'INVALID_ACTION', 'الإجراء غير صحيح.');
      appointment.status = status;
      appointment.holdUntil = null;
      appointment.reschedule = null;
      appointment.history.push({ status, at: new Date(), message, actor: 'admin' });
      await appointment.save({ session });
      if (!['pending', 'confirmed'].includes(status))
        await Reservation.deleteMany({ appointmentId: appointment._id }, { session });
      result = appointment.toObject();
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000)
      throw new ApiError(
        409,
        'SLOT_UNAVAILABLE',
        'الوقت الجديد حُجز أثناء المراجعة. الموعد الأصلي محفوظ.',
      );
    throw e;
  } finally {
    await session.endSession();
  }
  return publicAppointment(result!);
}
