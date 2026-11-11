import { bookingSchema, dateSchema, statuses, statusLabels, timeSchema, buildArabicPattern, rankByRelevance } from '@future/shared';
import { Router } from 'express';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { ApiError } from '../../lib/api-error.js';
import { Appointment } from '../../models/appointment.model.js';
import { Audit } from '../../models/audit.model.js';
import { Interest } from '../../models/interest.model.js';
import { Reservation } from '../../models/reservation.model.js';
import { SubscriptionModel } from '../../models/subscription.model.js';
import { User } from '../../models/user.model.js';
import { publicAppointment } from '../../presenters/appointment.js';
import { audit } from '../../services/audit.service.js';
import { adminDecision } from '../../services/booking/admin-actions.js';
import { createNotification } from '../../services/notification.service.js';
import { appointmentAvailability } from '../../services/booking/availability.js';
import { createBooking } from '../../services/booking/requests.js';
import { expirePending } from '../../services/booking/reservations.js';
import { verifyQrPayload } from '../../services/qr.service.js';
export const router = Router();
router.get('/appointments', async (req, res) => {
  await expirePending();
  const q = z
    .object({ date: dateSchema.optional(), status: z.enum(statuses).optional() })
    .parse(req.query);
  const rows = await Appointment.find(q)
    .select('+phone +whatsapp')
    .sort({ date: 1, time: 1 })
    .limit(200)
    .lean();

  const userIds = rows.map((r) => r.userId).filter(Boolean);
  const users = userIds.length > 0
    ? await User.find({ _id: { $in: userIds } }).select('_id name fileNumber').lean()
    : [];
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  res.json({
    appointments: rows.map((r) => {
      const u = r.userId ? userMap.get(String(r.userId)) : null;
      return {
        ...publicAppointment(r),
        name: u?.name || r.name,
        fileNumber: u?.fileNumber,
        phone: r.phone,
        whatsapp: r.whatsapp,
      };
    }),
  });
});

router.post('/appointments/verify-qr', async (req, res) => {
  const { qrData } = z
    .object({ qrData: z.string().trim().min(1, 'كود الـ QR مطلوب.') })
    .parse(req.body);
  const verifyResult = verifyQrPayload(qrData);

  if (!verifyResult.valid || !verifyResult.reference) {
    throw new ApiError(400, 'INVALID_QR', verifyResult.error || 'رمز QR غير صالح.');
  }

  const appt = await Appointment.findOne({ reference: verifyResult.reference.toUpperCase() })
    .select('+phone +whatsapp')
    .lean();

  if (!appt) {
    throw new ApiError(404, 'NOT_FOUND', 'لم يتم العثور على أي حجز مسجل يطابق هذا الرمز في النظام.');
  }

  // Strict workflow: A pending (unconfirmed) booking cannot be used to check in or enter the patient profile!
  if (appt.status === 'pending') {
    throw new ApiError(
      400,
      'APPOINTMENT_PENDING',
      `طلب الحجز #${appt.reference} ما زال معلقاً وبانتظار الموافقة! لا يمكن الدخول إلى الملف الطبي بناءً على حجز غير معتمد. يرجى مراجعة واعتماد الطلب أولاً من جدول المواعيد.`
    );
  }

  if (['cancelled', 'rejected', 'expired'].includes(appt.status)) {
    throw new ApiError(
      400,
      'APPOINTMENT_INVALID',
      `لا يمكن استخدام هذا الرمز: حالة الحجز غير صالحة للدخول (${statusLabels[appt.status] || appt.status}).`
    );
  }

  // Audit logging as required
  if (verifyResult.isLegacy) {
    await audit(req.authUser?._id, 'qr.legacy_scan', appt.reference);
  } else {
    await audit(req.authUser?._id, 'qr.scan', appt.reference);
  }

  res.json({
    valid: true,
    isLegacy: Boolean(verifyResult.isLegacy),
    reference: appt.reference,
    appointmentId: String(appt._id),
    name: appt.name,
    phone: appt.phone,
    userId: appt.userId ? String(appt.userId) : null,
    targetUrl: `/admin/patients/${encodeURIComponent(appt.reference)}`,
  });
});

router.post('/appointments/:reference/decision', async (req, res) => {
  const d = z
    .object({
      action: z.enum([
        'approve',
        'reject',
        'cancel',
        'complete',
        'no_show',
        'reschedule',
        'decline_change',
      ]),
      reason: z.string().trim().max(250).optional(),
      date: dateSchema.optional(),
      time: timeSchema.optional(),
    })
    .strict()
    .parse(req.body);
  if (['reject', 'decline_change'].includes(d.action) && !d.reason)
    throw new ApiError(400, 'REASON_REQUIRED', 'أضيفي سبب الرفض.');
  const result = await adminDecision(
    String(req.params.reference),
    d.action,
    d.reason,
    d.date,
    d.time,
  );
  await Audit.create({
    actorId: req.authUser?._id,
    action: 'appointment.' + d.action,
    target: String(req.params.reference),
  });

  // Automatically notify patient of appointment status updates
  try {
    const rawAppt = await Appointment.findOne({ reference: String(req.params.reference) })
      .select('+phone userId date time service')
      .lean();
    if (rawAppt && (rawAppt.userId || rawAppt.phone)) {
      let notifTitle = '';
      let notifBody = '';
      if (d.action === 'approve') {
        notifTitle = 'تم تأكيد موعدك بنجاح! 📅';
        notifBody = 'تم تأكيد حجز موعدك بتاريخ ' + rawAppt.date + ' الساعة ' + rawAppt.time + '. يسعدنا استقبالك في مركز المستقبل.';
      } else if (d.action === 'reschedule') {
        notifTitle = 'تعديل موعد الحجز 🕒';
        notifBody = 'تم تعديل موعدك إلى تاريخ ' + rawAppt.date + ' الساعة ' + rawAppt.time + '.';
      } else if (d.action === 'cancel' || d.action === 'reject') {
        notifTitle = 'تحديث بشأن الموعد ⚠️';
        notifBody = d.reason ? ('تم إلغاء الموعد. السبب: ' + d.reason) : 'تم إلغاء حجز موعدك لدى مركز المستقبل.';
      } else if (d.action === 'complete') {
        notifTitle = 'زيارتك لمركز المستقبل ✨';
        notifBody = 'سعدنا بزيارتك اليوم لمركز المستقبل للتغذية. نتمنى لكِ دوام الصحة والعافية!';
      }

      if (notifTitle) {
        await createNotification({
          userId: rawAppt.userId ? String(rawAppt.userId) : undefined,
          patientPhone: rawAppt.phone || undefined,
          type: 'appointment',
          title: notifTitle,
          body: notifBody,
          link: '/account?tab=appointments',
        });
      }
    }
  } catch (err) {
    console.error('[Notification] Failed to create appointment notification:', err);
  }
  res.json(result);
});

router.get('/reservations', async (_req, res) =>
  res.json({ active: await Reservation.countDocuments() }),
);
router.get('/overview', async (_req, res) => {
  await expirePending();
  const cairoNow = DateTime.now().setZone('Africa/Cairo');
  const today = cairoNow.toISODate()!;
  const in5Days = cairoNow.plus({ days: 5 }).toISODate()!;

  const [
    pending,
    confirmedToday,
    changes,
    awaitingOutcome,
    newInterests,
    patients,
    confirmedTotal,
    todayTotal,
    todayAppts,
    allActiveSubs,
    todaySubs,
  ] = await Promise.all([
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed', date: today }),
    Appointment.countDocuments({
      status: { $in: ['pending', 'confirmed'] },
      reschedule: { $ne: null },
    }),
    Appointment.find({ status: 'confirmed', date: { $lte: today } })
      .select('date time duration')
      .lean()
      .then(
        (rows) =>
          rows.filter(
            (a) =>
              DateTime.fromISO(`${a.date}T${a.time}`, { zone: 'Africa/Cairo' }).plus({
                minutes: a.duration,
              }) <= DateTime.now(),
          ).length,
      ),
    Interest.countDocuments({ status: 'new' }),
    User.countDocuments({ role: 'patient' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ date: today }),
    Appointment.find({ date: today }).select('status price').lean(),
    SubscriptionModel.find({ status: 'active' }).lean(),
    SubscriptionModel.find({ startDate: today }).select('price').lean(),
  ]);

  let todayRevenue = 0;
  let todayCompleted = 0;
  let todayConfirmed = 0;
  let todayPending = 0;

  for (const a of todayAppts) {
    if (a.status === 'completed') {
      todayCompleted++;
      if (typeof a.price === 'number') todayRevenue += a.price;
    } else if (a.status === 'confirmed') {
      todayConfirmed++;
      if (typeof a.price === 'number') todayRevenue += a.price;
    } else if (a.status === 'pending') {
      todayPending++;
    }
  }

  let expiringSubscriptionsCount = 0;
  let todaySubscriptionRevenue = 0;

  for (const sub of allActiveSubs) {
    const isExpiringSessions = (sub.sessionsTotal - sub.sessionsUsed) <= 1;
    const isExpiringDate = Boolean(sub.endDate && sub.endDate <= in5Days);
    if (isExpiringSessions || isExpiringDate) {
      expiringSubscriptionsCount++;
    }
  }

  for (const s of todaySubs) {
    if (typeof s.price === 'number') todaySubscriptionRevenue += s.price;
  }

  const totalDailyRevenue = todayRevenue + todaySubscriptionRevenue;

  res.json({
    pending,
    confirmedToday,
    changes,
    awaitingOutcome,
    newInterests,
    patients,
    confirmedTotal,
    todayTotal,
    todayRevenue,
    todaySubscriptionRevenue,
    totalDailyRevenue,
    todayCompleted,
    todayConfirmed,
    todayPending,
    activeSubscriptionsCount: allActiveSubs.length,
    expiringSubscriptionsCount,
  });
});

router.get('/booking-list', async (req, res) => {
  await expirePending();
  const q = z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      search: z.string().max(100).default(''),
      date: dateSchema.optional(),
      status: z.enum(statuses).optional(),
      serviceId: z.string().max(60).optional(),
      changes: z.enum(['true']).optional(),
    })
    .parse(req.query);
  const filter: Record<string, unknown> = {};
  if (q.date) filter.date = q.date;
  if (q.status) filter.status = q.status;
  if (q.serviceId) filter.serviceId = q.serviceId;
  if (q.changes) filter.reschedule = { $ne: null };
  if (q.search && q.search.trim()) {
    const trimmed = q.search.trim();
    const pattern = buildArabicPattern(trimmed);
    const rawDigits = trimmed.replace(/\D/g, '');
    const userPhoneCond = rawDigits.length >= 3 ? [{ phone: { $regex: rawDigits } }] : [];
    const fileNum = Number(rawDigits);
    const userFileNumCond = !isNaN(fileNum) && rawDigits.length >= 1 && rawDigits.length <= 6 ? [{ fileNumber: fileNum }] : [];

    const matchedUsers = await User.find({
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        ...userPhoneCond,
        ...userFileNumCond,
      ],
    })
      .select('_id')
      .lean();
    const matchedUserIds = matchedUsers.map((u) => u._id);

    const apptPhoneCond = rawDigits.length >= 3 ? [{ phone: { $regex: rawDigits } }] : [];

    filter.$or = [
      { reference: { $regex: trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { name: { $regex: pattern, $options: 'i' } },
      ...apptPhoneCond,
      ...(matchedUserIds.length > 0 ? [{ userId: { $in: matchedUserIds } }] : []),
    ];

    // Fetch all matching candidates (up to 300) so relevance ranking works across the whole dataset
    const rows = await Appointment.find(filter)
      .select('+phone +whatsapp')
      .sort({ date: -1, time: 1 })
      .limit(300)
      .lean();

    const userIds = rows.map((a) => a.userId).filter(Boolean);
    const users = userIds.length > 0
      ? await User.find({ _id: { $in: userIds } }).select('_id name fileNumber').lean()
      : [];
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    let mappedAppointments = rows.map((a) => {
      const u = a.userId ? userMap.get(String(a.userId)) : null;
      return {
        ...publicAppointment(a),
        name: u?.name || a.name,
        fileNumber: u?.fileNumber,
        phone: a.phone,
        whatsapp: a.whatsapp,
        userId: a.userId ? String(a.userId) : null,
        createdAt: new Date(a.createdAt).toISOString(),
      };
    });

    mappedAppointments = rankByRelevance(
      mappedAppointments,
      trimmed,
      (a) => a.name,
      (a) => a.phone,
      (a) => a.reference,
      (a) => (a as any).fileNumber,
    );

    const total = mappedAppointments.length;
    const paginated = mappedAppointments.slice((q.page - 1) * 20, q.page * 20);

    return res.json({
      appointments: paginated,
      total,
      page: q.page,
    });
  }

  const [rows, total] = await Promise.all([
    Appointment.find(filter)
      .select('+phone +whatsapp')
      .sort({ date: -1, time: 1 })
      .skip((q.page - 1) * 20)
      .limit(20)
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  const userIds = rows.map((a) => a.userId).filter(Boolean);
  const users = userIds.length > 0
    ? await User.find({ _id: { $in: userIds } }).select('_id name fileNumber').lean()
    : [];
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const mappedAppointments = rows.map((a) => {
    const u = a.userId ? userMap.get(String(a.userId)) : null;
    return {
      ...publicAppointment(a),
      name: u?.name || a.name,
      fileNumber: u?.fileNumber,
      phone: a.phone,
      whatsapp: a.whatsapp,
      userId: a.userId ? String(a.userId) : null,
      createdAt: new Date(a.createdAt).toISOString(),
    };
  });

  res.json({
    appointments: mappedAppointments,
    total,
    page: q.page,
  });
});

router.get('/appointments/:reference/availability', async (req, res) => {
  const a = await Appointment.findOne({ reference: req.params.reference }).lean();
  if (!a) throw new ApiError(404, 'NOT_FOUND', 'الطلب غير موجود.');
  res.json(await appointmentAvailability(a, dateSchema.parse(req.query.date)));
});

router.post('/manual-booking', async (req, res) => {
  const data = bookingSchema.parse(req.body);
  const key = z.string().uuid().parse(req.get('Idempotency-Key'));
  const result = await createBooking(data, key);
  await audit(req.authUser?._id, 'appointment.create', result.appointment.reference);
  res.status(201).json(result);
});
