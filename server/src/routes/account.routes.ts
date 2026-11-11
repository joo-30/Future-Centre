import { Router } from 'express';
import { inbodyPublic, interestPublic, notificationPublic, prescriptionPublic, subscriptionPublic } from '../presenters/portal.js';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notification.service.js';

import { z } from 'zod';

import { rescheduleSchema } from '@future/shared';

import { Appointment } from '../models/appointment.model.js';
import { InBody } from '../models/inbody.model.js';
import { Interest } from '../models/interest.model.js';
import { Prescription } from '../models/prescription.model.js';
import { SubscriptionModel } from '../models/subscription.model.js';

import { requireUser } from '../middleware/session.js';

import { ApiError } from '../lib/api-error.js';
import { privateTokenFor } from '../lib/tracking-tokens.js';
import { publicAppointment } from '../presenters/appointment.js';
import { appointmentAvailability } from '../services/booking/availability.js';
import { cancelByToken, requestReschedule } from '../services/booking/patient-actions.js';
import { findByToken } from '../services/booking/requests.js';
import { expirePending } from '../services/booking/reservations.js';

export const accountRouter = Router();

accountRouter.use(requireUser, (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

accountRouter.get('/', async (req, res) => {
  await expirePending();
  const userId = req.authUser!._id;

  const [appointments, interests, subscriptions, inbodyRecords, prescriptions] = await Promise.all([
    Appointment.find({ userId }).select('+phone').sort({ date: -1, time: -1 }).limit(200).lean(),
    Interest.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    SubscriptionModel.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    InBody.find({ userId }).sort({ date: -1 }).limit(50).lean(),
    Prescription.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(50).lean(),
  ]);
  res.json({
    appointments: appointments.map(publicAppointment),
    interests: interests.map((s) => interestPublic(s)),
    subscriptions: subscriptions.map((s) => subscriptionPublic(s)),
    inbody: inbodyRecords.map(inbodyPublic),
    prescriptions: prescriptions.map(prescriptionPublic),
  });
});

accountRouter.get('/appointments/:reference/availability', async (req, res) => {
  const a = await Appointment.findOne({
    reference: req.params.reference,
    userId: req.authUser!._id,
  }).lean();
  if (!a) throw new ApiError(404, 'NOT_FOUND', 'الموعد غير موجود في حسابك.');
  res.json(
    await appointmentAvailability(
      a,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .parse(req.query.date),
    ),
  );
});

accountRouter.post('/claim', async (req, res) => {
  const { token } = z
    .object({ token: z.string().length(43) })
    .strict()
    .parse(req.body);
  const a = await findByToken(token);
  const result = await Appointment.findOneAndUpdate(
    { _id: a._id, $or: [{ userId: null }, { userId: req.authUser!._id }] },
    { $set: { userId: req.authUser!._id } },
    { returnDocument: 'after' },
  )
    .select('+phone')
    .lean();
  if (!result)
    throw new ApiError(409, 'ALREADY_LINKED', 'هذا الطلب مرتبط بحساب آخر. تواصلي مع المركز.');
  res.json(publicAppointment(result));
});

accountRouter.post('/appointments/:reference/:action', async (req, res) => {
  const a = await Appointment.findOne({
    reference: req.params.reference,
    userId: req.authUser!._id,
  })
    .select('+idempotencyHash +phone')
    .lean();
  if (!a) throw new ApiError(404, 'NOT_FOUND', 'الموعد غير موجود في حسابك.');
  const token = privateTokenFor(a);
  if (req.params.action === 'cancel') return res.json(await cancelByToken(token));
  if (req.params.action === 'reschedule') {
    const data = rescheduleSchema.parse(req.body);
    return res.json(await requestReschedule(token, data.date, data.time));
  }
  throw new ApiError(404, 'NOT_FOUND', 'الإجراء غير متاح.');
});

accountRouter.get('/notifications', async (req, res) => {
  const userId = req.authUser!._id;
  const notifData = await getUserNotifications(userId, req.authUser?.phone, 50);
  res.json({
    notifications: notifData.notifications.map(notificationPublic),
    unreadCount: notifData.unreadCount,
  });
});

accountRouter.post('/notifications/:id/read', async (req, res) => {
  const userId = req.authUser!._id;
  const updated = await markNotificationAsRead(req.params.id, userId, req.authUser?.phone);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'الإشعار غير موجود.');
  res.json({ ok: true, notification: notificationPublic(updated) });
});

accountRouter.post('/notifications/read-all', async (req, res) => {
  const userId = req.authUser!._id;
  await markAllNotificationsAsRead(userId, req.authUser?.phone);
  res.json({ ok: true });
});

accountRouter.get('/push-key', async (_req, res) => {
  const { getVapidPublicKey } = await import('../services/web-push.service.js');
  res.json({ publicKey: getVapidPublicKey() });
});

accountRouter.post('/subscribe-push', async (req, res) => {
  const pushSubSchema = z.object({
    subscription: z.object({
      endpoint: z.string().url('Endpoint URL غير صالح.'),
      keys: z.object({
        p256dh: z.string().min(1, 'مفتاح p256dh مطلوب.'),
        auth: z.string().min(1, 'مفتاح auth مطلوب.'),
      }),
    }),
  });
  const { subscription } = pushSubSchema.parse(req.body);
  const { savePushSubscription } = await import('../services/web-push.service.js');
  await savePushSubscription({
    userId: req.authUser!._id,
    patientPhone: req.authUser?.phone,
    subscription,
    userAgent: req.headers['user-agent'] || '',
  });
  res.json({ ok: true });
});

accountRouter.post('/test-push', async (req, res) => {
  const { sendPushNotification } = await import('../services/web-push.service.js');
  const result = await sendPushNotification({
    userId: req.authUser!._id,
    patientPhone: req.authUser?.phone,
    title: 'د. رنا الشوري • مركز المستقبل 🩺',
    body: 'مرحباً بكِ! تم إرسال هذا التنبيه التجريبي بنجاح لشاشة هاتفك وستارة الإشعارات.',
    link: '/account',
  });
  if (result.sent === 0) {
    return res.status(400).json({
      ok: false,
      sent: 0,
      error: 'لم نتمكن من الوصول لهاتفك، تأكدي من الضغط على "تفعيل الإشعارات" في المتصفح والموافقة على إذن التنبيهات أولاً.',
    });
  }
  res.json({ ok: true, sent: result.sent, result });
});
