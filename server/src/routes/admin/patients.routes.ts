import { Router } from 'express';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { z } from 'zod';
import { buildArabicPattern, phoneSchema, rankByRelevance } from '@future/shared';
import { ApiError } from '../../lib/api-error.js';
import { hash } from '../../lib/crypto.js';
import { Appointment } from '../../models/appointment.model.js';
import { InBody } from '../../models/inbody.model.js';
import { Interest } from '../../models/interest.model.js';
import { PatientNote } from '../../models/patient-note.model.js';
import { Prescription } from '../../models/prescription.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { Session } from '../../models/session.model.js';
import { SubscriptionModel } from '../../models/subscription.model.js';
import { User, type UserRecord } from '../../models/user.model.js';
import { inbodyPublic, interestPublic, patientNotePublic, prescriptionPublic, subscriptionPublic } from '../../presenters/portal.js';
import { audit } from '../../services/audit.service.js';
import { createUser, passwordHash, publicUser, recoveryCode } from '../../services/auth.service.js';
import { id, subscriptionSchema } from '../../validation/subscription.js';
export const router = Router();
router.get('/interests', async (_req, res) =>
  res.json({
    interests: await Interest.find({}).select('+phone').sort({ createdAt: -1 }).limit(100).lean(),
  }),
);
router.get('/patients', async (req, res) => {
  const { search } = z.object({ search: z.string().max(100).default('') }).parse(req.query);
  const trimmed = search.trim();
  let users: UserRecord[] = [];

  if (trimmed) {
    const pattern = buildArabicPattern(trimmed);
    const rawDigits = trimmed.replace(/\D/g, '');
    const phoneFilter = rawDigits.length >= 3 ? [{ phone: { $regex: rawDigits } }] : [];
    const fileNum = Number(rawDigits);
    const fileNumFilter = !isNaN(fileNum) && rawDigits.length >= 1 && rawDigits.length <= 6 ? [{ fileNumber: fileNum }] : [];

    users = await User.find({
      role: 'patient',
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        ...phoneFilter,
        ...fileNumFilter,
      ],
    })
      .limit(300)
      .lean();

    users = rankByRelevance(
      users,
      trimmed,
      (u) => u.name,
      (u) => u.phone,
      undefined,
      (u) => u.fileNumber,
    );
  } else {
    users = await User.find({ role: 'patient' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  res.json({ patients: users.map(publicUser) });
});

function extractPhoneVariants(raw: string): string[] {
  const trimmed = (raw || '').trim();
  if (!trimmed) return [];
  const digits = trimmed.replace(/\D/g, '');
  const set = new Set<string>();
  set.add(trimmed);
  if (digits.length >= 8) {
    const withoutCountry = digits.startsWith('20') ? digits.slice(2) : digits;
    const local = '0' + withoutCountry.replace(/^0+/, '');
    const intl = '+20' + withoutCountry.replace(/^0+/, '');
    set.add(local);
    set.add(intl);
    set.add(withoutCountry);
    set.add(digits);
  }
  return Array.from(set);
}

router.post('/patients', async (req, res) => {
  const schema = z.object({
    name: z.string().trim().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
    phone: phoneSchema,
    password: z.string().min(6).max(100).optional(),
  });

  const { name, phone, password: explicitPassword } = schema.parse(req.body);

  // Check if patient already exists with any phone variation
  const phoneVariants = extractPhoneVariants(phone);
  const existingUser = await User.findOne({
    $or: [{ phone }, { phone: { $in: phoneVariants } }],
  }).lean();

  if (existingUser) {
    throw new ApiError(
      409,
      'PATIENT_EXISTS',
      `يوجد حساب مسجل بالفعل برقم الهاتف هذا باسم: "${existingUser.name}" (ملف #${existingUser.fileNumber || 'غير محدد'}).`,
    );
  }

  // Default initial password: if not explicitly given, use the local phone number (e.g. 01012345678)
  const localDigits = phone.replace(/^\+20/, '0').replace(/^\+/, '');
  const initialPassword = explicitPassword?.trim() || localDigits;

  const result = await createUser(name, phone, initialPassword, 'patient');

  // Auto-link any past guest records for this phone
  await Appointment.updateMany({ phone: { $in: phoneVariants }, userId: null }, { $set: { userId: result.user._id } });
  await Interest.updateMany({ phone: { $in: phoneVariants }, userId: null }, { $set: { userId: result.user._id } });
  await SubscriptionModel.updateMany({ phone: { $in: phoneVariants }, userId: null }, { $set: { userId: result.user._id } });
  await InBody.updateMany({ patientPhone: { $in: phoneVariants }, userId: null }, { $set: { userId: result.user._id } });
  await Prescription.updateMany({ patientPhone: { $in: phoneVariants }, userId: null }, { $set: { userId: result.user._id } });

  await audit(req.authUser?._id, 'patient.create', result.user._id.toString());

  res.status(201).json({
    user: publicUser(result.user),
    initialPassword,
    recoveryCode: result.recoveryCode,
  });
});

router.get('/patients/:identifier/history', async (req, res) => {
  const { identifier } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

  let user = null;
  if (isObjectId) {
    user = await User.findById(identifier).lean();
  }

  const rawDigits = identifier.replace(/\D/g, '');
  const possibleFileNum = Number(rawDigits);
  if (!user && !isNaN(possibleFileNum) && rawDigits.length >= 1 && rawDigits.length <= 6) {
    user = await User.findOne({ fileNumber: possibleFileNum }).lean();
  }

  const phoneCandidates = user?.phone
    ? extractPhoneVariants(user.phone)
    : extractPhoneVariants(identifier);

  if (!user && phoneCandidates.length) {
    user = await User.findOne({ phone: { $in: phoneCandidates } }).lean();
  }

  const cleanRef = identifier.trim().toUpperCase();
  const refVariants = [
    cleanRef,
    cleanRef.replace(/^FC-?/, ''),
    `FC-${cleanRef.replace(/^FC-?/, '')}`,
  ];

  if (!user) {
    const appt = await Appointment.findOne({ reference: { $in: refVariants } })
      .select('+phone +whatsapp')
      .lean();
    if (appt) {
      if (appt.status === 'pending') {
        throw new ApiError(
          400,
          'BOOKING_PENDING',
          `طلب الحجز #${appt.reference} ما زال معلقاً وبانتظار موافقة الإدارة. لا يمكن الدخول إلى الملف الطبي بناءً على حجز غير معتمد. يرجى مراجعة واعتماد الطلب أولاً من جدول المواعيد.`
        );
      }
      if (appt.userId) {
        user = await User.findById(appt.userId).lean();
      }
      if (!user && appt.phone) {
        const apptPhoneVars = extractPhoneVariants(appt.phone);
        user = await User.findOne({ phone: { $in: apptPhoneVars } }).lean();
        if (!user) {
          user = {
            _id: appt._id,
            name: appt.name,
            phone: appt.phone,
            createdAt: appt.createdAt,
            role: 'patient',
          } as any;
        }
      } else if (!user) {
        user = {
          _id: appt._id,
          name: appt.name,
          phone: appt.phone,
          createdAt: appt.createdAt,
          role: 'patient',
        } as any;
      }

      if (appt.phone) {
        for (const p of extractPhoneVariants(appt.phone)) {
          if (!phoneCandidates.includes(p)) phoneCandidates.push(p);
        }
      }
    }
  }

  const userId = user?._id || (isObjectId ? new mongoose.Types.ObjectId(identifier) : null);

  const matchUser = userId ? [{ userId }] : [];
  const matchPhoneInbody = phoneCandidates.length ? [{ patientPhone: { $in: phoneCandidates } }] : [];
  const matchPhoneSub = phoneCandidates.length ? [{ phone: { $in: phoneCandidates } }] : [];
  const matchPhoneAppt = phoneCandidates.length
    ? [{ phone: { $in: phoneCandidates } }, { whatsapp: { $in: phoneCandidates } }]
    : [];
  const matchRefAppt = [{ reference: { $in: refVariants } }];

  const inbodyFilter =
    matchUser.length || matchPhoneInbody.length
      ? { $or: [...matchUser, ...matchPhoneInbody] }
      : { patientPhone: identifier };

  const rxFilter =
    matchUser.length || matchPhoneInbody.length
      ? { $or: [...matchUser, ...matchPhoneInbody] }
      : { patientPhone: identifier };

  const subFilter =
    matchUser.length || matchPhoneSub.length
      ? { $or: [...matchUser, ...matchPhoneSub] }
      : { phone: identifier };

  const apptFilter =
    matchUser.length || matchPhoneAppt.length
      ? { $or: [...matchUser, ...matchPhoneAppt, ...matchRefAppt] }
      : { $or: [{ phone: identifier }, ...matchRefAppt] };

  const noteFilter =
    matchUser.length || matchPhoneInbody.length
      ? { $or: [...matchUser, ...matchPhoneInbody] }
      : { patientPhone: identifier };

  const [inbodyList, rxList, subList, apptList, noteList] = await Promise.all([
    InBody.find(inbodyFilter).sort({ date: -1, createdAt: -1 }).limit(100).lean(),
    Prescription.find(rxFilter).sort({ date: -1, createdAt: -1 }).limit(100).lean(),
    SubscriptionModel.find(subFilter).sort({ createdAt: -1 }).limit(50).lean(),
    Appointment.find(apptFilter)
      .select('+phone +whatsapp')
      .sort({ date: -1, time: -1 })
      .limit(100)
      .lean(),
    PatientNote.find(noteFilter).sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  // Reject immediately if no user, no appointment, no InBody, no prescription, and no record exists
  if (
    !user &&
    inbodyList.length === 0 &&
    rxList.length === 0 &&
    subList.length === 0 &&
    apptList.length === 0 &&
    noteList.length === 0
  ) {
    throw new ApiError(404, 'NOT_FOUND', 'لم يتم العثور على أي ملف مريض أو حجز يطابق هذا المعرّف.');
  }

  const patientName =
    user?.name ||
    rxList[0]?.patientName ||
    inbodyList[0]?.patientName ||
    subList[0]?.name ||
    apptList[0]?.name ||
    '';

  const patientPhone =
    user?.phone ||
    rxList[0]?.patientPhone ||
    inbodyList[0]?.patientPhone ||
    subList[0]?.phone ||
    apptList[0]?.phone ||
    '';

  // Compute Metrics
  const weightRecords: { date: string; weight: number }[] = [];
  for (const b of inbodyList) {
    if (typeof b.weight === 'number' && !isNaN(b.weight)) {
      weightRecords.push({ date: b.date, weight: b.weight });
    }
  }
  for (const r of rxList) {
    const pw = parseFloat(r.weight);
    if (!isNaN(pw) && pw > 0) {
      weightRecords.push({ date: r.date, weight: pw });
    }
  }
  weightRecords.sort((a, b) => a.date.localeCompare(b.date));

  const initialWeight = weightRecords.length > 0 ? weightRecords[0].weight : null;
  const currentWeight =
    weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : null;
  const weightDelta =
    initialWeight !== null && currentWeight !== null
      ? Number((currentWeight - initialWeight).toFixed(1))
      : null;

  const latestRx = rxList[0];
  const targetWeightParsed = latestRx?.targetWeight ? parseFloat(latestRx.targetWeight) : NaN;
  const targetWeight =
    !isNaN(targetWeightParsed) && targetWeightParsed > 0 ? targetWeightParsed : null;

  const heightParsed = latestRx?.height ? parseFloat(latestRx.height) : NaN;
  const height = !isNaN(heightParsed) && heightParsed > 0 ? heightParsed : null;

  const latestInbody = inbodyList[0];
  const latestFatPercent =
    latestInbody?.bodyFatPercent ??
    (latestRx?.bodyFatPercent ? parseFloat(latestRx.bodyFatPercent) || null : null);
  const latestMuscleMass =
    latestInbody?.muscleMass ??
    (latestRx?.muscleMass ? parseFloat(latestRx.muscleMass) || null : null);
  const latestVisceralFat = latestInbody?.visceralFat ?? null;
  const latestWaistCm = latestInbody?.waistCm ?? null;

  let bmi: number | null = null;
  let bmiCategory: string | null = null;
  if (currentWeight && height && height > 50 && height < 250) {
    const heightInMeters = height / 100;
    bmi = Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));
    if (bmi < 18.5) bmiCategory = 'نقص في الوزن (Underweight)';
    else if (bmi < 25) bmiCategory = 'وزن مثالي وطبيعي (Normal)';
    else if (bmi < 30) bmiCategory = 'زيادة في الوزن (Overweight)';
    else if (bmi < 35) bmiCategory = 'سمنة درجة أولى (Class I)';
    else if (bmi < 40) bmiCategory = 'سمنة درجة ثانية (Class II)';
    else bmiCategory = 'سمنة مفرطة (Class III)';
  }

  const activeSubDoc =
    subList.find((s) => s.status === 'active' || s.status === 'pending') || subList[0] || null;

  res.json({
    patient: {
      id: user ? String(user._id) : isObjectId ? identifier : null,
      fileNumber: user?.fileNumber,
      name: patientName,
      phone: patientPhone,
      role: user?.role || 'patient',
      createdAt: user?.createdAt ? new Date(user.createdAt).toISOString() : undefined,
    },
    metrics: {
      initialWeight,
      currentWeight,
      targetWeight,
      weightDelta,
      latestFatPercent,
      latestMuscleMass,
      latestVisceralFat,
      latestWaistCm,
      height,
      bmi,
      bmiCategory,
    },
    activeSubscription: activeSubDoc ? subscriptionPublic(activeSubDoc, true) : null,
    subscriptions: subList.map((s) => subscriptionPublic(s, true)),
    inbodyRecords: inbodyList.map(inbodyPublic),
    prescriptions: rxList.map(prescriptionPublic),
    appointments: apptList.map((a) => ({
      id: String(a._id),
      reference: a.reference,
      serviceTitle: a.serviceTitle,
      date: a.date,
      time: a.time,
      status: a.status,
      duration: a.duration,
      price: a.price,
    })),
    clinicalNotes: noteList.map(patientNotePublic),
  });
});

router.post('/patients/:identifier/notes', async (req, res) => {
  const { identifier } = req.params;
  const { text, patientName } = z
    .object({
      text: z.string().trim().min(2, 'اكتبي نص الملاحظة').max(2000),
      patientName: z.string().max(100).optional(),
    })
    .parse(req.body);

  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  let user = null;
  if (isObjectId) {
    user = await User.findById(identifier).lean();
  }
  const phoneCandidates = user?.phone
    ? extractPhoneVariants(user.phone)
    : extractPhoneVariants(identifier);
  if (!user && phoneCandidates.length) {
    user = await User.findOne({ phone: { $in: phoneCandidates } }).lean();
  }

  if (!user && (identifier.toUpperCase().startsWith('FC-') || identifier.length >= 6)) {
    const appt = await Appointment.findOne({ reference: identifier.toUpperCase() }).lean();
    if (appt) {
      if (appt.userId) {
        user = await User.findById(appt.userId).lean();
      }
      if (!user && appt.phone) {
        const apptPhoneVars = extractPhoneVariants(appt.phone);
        user = await User.findOne({ phone: { $in: apptPhoneVars } }).lean();
        if (!user) {
          user = {
            _id: appt._id,
            name: appt.name,
            phone: appt.phone,
            createdAt: appt.createdAt,
            role: 'patient',
          } as any;
        }
      }
    }
  }

  const note = await PatientNote.create({
    userId: user?._id || (isObjectId ? new mongoose.Types.ObjectId(identifier) : null),
    patientPhone: user?.phone || identifier,
    patientName: patientName || user?.name || '',
    text,
    authorName: 'طبيبة المركز',
  });

  await audit(req.authUser?._id, 'patient.add_note', String(note._id));
  res.status(201).json(patientNotePublic(note.toObject()));
});


router.post('/patients/:id/reset-password', async (req, res) => {
  const patientId = id.parse(req.params.id);
  const { password } = z
    .object({
      password: z.string().min(8).max(128).optional(),
    })
    .parse(req.body || {});

  const patient = await User.findOne({ _id: patientId, role: 'patient' });
  if (!patient) throw new ApiError(404, 'NOT_FOUND', 'حساب المريض غير موجود.');

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const tempPassword = password && password.trim() ? password.trim() : `Future@${randomDigits}`;

  const newNextCode = recoveryCode();
  patient.passwordHash = await passwordHash(tempPassword);
  patient.recoveryHash = hash(newNextCode);
  patient.authVersion = (patient.authVersion || 0) + 1;
  await patient.save();

  await Session.deleteMany({ userId: patient._id });
  await audit(req.authUser?._id, 'patient.reset_password', String(patient._id));

  res.json({
    ok: true,
    temporaryPassword: tempPassword,
    patient: publicUser(patient),
  });
});

router.get('/program-requests', async (_req, res) =>
  res.json({
    interests: (
      await Interest.find({}).select('+phone').sort({ createdAt: -1 }).limit(200).lean()
    ).map((s) => interestPublic(s, true)),
  }),
);

router.patch('/program-requests/:id', async (req, res) => {
  const interestId = id.parse(req.params.id);
  const { status } = z
    .object({ status: z.enum(['new', 'contacted', 'converted', 'closed']) })
    .strict()
    .parse(req.body);
  const updated = await Interest.findByIdAndUpdate(
    interestId,
    { $set: { status } },
    { returnDocument: 'after' },
  );
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'الطلب غير موجود.');
  await audit(req.authUser?._id, 'interest.' + status, String(interestId));
  res.json({ ok: true });
});

router.get('/subscriptions', async (_req, res) =>
  res.json({
    subscriptions: (await SubscriptionModel.find({}).sort({ createdAt: -1 }).limit(200).lean()).map(
      (s) => subscriptionPublic(s, true),
    ),
  }),
);

router.put('/subscriptions/:id', async (req, res) => {
  const subId =
    req.params.id === 'new'
      ? new mongoose.Types.ObjectId()
      : new mongoose.Types.ObjectId(id.parse(req.params.id));
  const data = subscriptionSchema.parse(req.body);
  if (data.userId && !(await User.exists({ _id: data.userId, role: 'patient' })))
    throw new ApiError(400, 'INVALID_PATIENT', 'اختاري حساب مريض صحيحًا.');
  const program = await ServiceModel.findOne({ id: data.programId }).lean();
  if (!program) throw new ApiError(404, 'NOT_FOUND', 'البرنامج غير موجود.');
  const existing = await SubscriptionModel.findById(subId).lean();
  if (req.params.id !== 'new' && !existing)
    throw new ApiError(404, 'NOT_FOUND', 'الاشتراك غير موجود.');
  const row = await SubscriptionModel.findOneAndUpdate(
    { _id: subId },
    {
      $set: {
        ...data,
        userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : null,
        programTitle:
          existing?.programId === data.programId ? existing.programTitle : program.title,
      },
      $setOnInsert: { reference: 'FC-P' + crypto.randomInt(10000, 99999) },
    },
    { upsert: true, returnDocument: 'after' },
  ).lean();
  await audit(req.authUser?._id, 'subscription.save', String(subId));
  res.json(subscriptionPublic(row!, true));
});

const inbodyInputSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  patientPhone: z.string().trim().min(8).max(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight: z.coerce.number().min(20).max(300),
  bodyFatPercent: z.coerce.number().min(1).max(70).optional(),
  muscleMass: z.coerce.number().min(5).max(150).optional(),
  waterPercent: z.coerce.number().min(10).max(85).optional(),
  visceralFat: z.coerce.number().min(1).max(30).optional(),
  waistCm: z.coerce.number().min(30).max(250).optional(),
  doctorNotes: z.string().max(1000).optional(),
  userId: z.string().optional().nullable(),
});

router.get('/inbody', async (req, res) => {
  const { search } = z.object({ search: z.string().max(100).default('') }).parse(req.query);
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const records = await InBody.find({
    ...(search
      ? {
          $or: [
            { patientName: { $regex: escaped, $options: 'i' } },
            { patientPhone: { $regex: escaped } },
          ],
        }
      : {}),
  })
    .sort({ date: -1, createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ records: records.map(inbodyPublic) });
});

router.post('/inbody', async (req, res) => {
  const data = inbodyInputSchema.parse(req.body);
  let linkedUserId: mongoose.Types.ObjectId | null = null;
  if (data.userId) {
    linkedUserId = new mongoose.Types.ObjectId(id.parse(data.userId));
  } else {
    const user = await User.findOne({ phone: data.patientPhone }).lean();
    if (user) linkedUserId = user._id;
  }
  const created = await InBody.create({
    ...data,
    userId: linkedUserId,
  });
  await audit(req.authUser?._id, 'inbody.create', String(created._id));
  res.status(201).json(inbodyPublic(created.toObject()));
});

router.delete('/inbody/:id', async (req, res) => {
  const recordId = id.parse(req.params.id);
  const deleted = await InBody.findByIdAndDelete(recordId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'الفحص غير موجود.');
  await audit(req.authUser?._id, 'inbody.delete', String(recordId));
  res.json({ ok: true });
});

const prescriptionInputSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional().nullable(),
  patientName: z.string().trim().min(2, 'اسم المريض مطلوب').max(100),
  patientPhone: z.string().trim().max(35).optional().default(''),
  date: z.string().trim().max(35).optional().default(() => new Date().toISOString().slice(0, 10)),
  nextDate: z.string().max(35).optional().default(''),
  age: z.string().max(20).optional().default(''),
  height: z.string().max(20).optional().default(''),
  goal: z.string().trim().max(300).optional().default('إنقاص وزن وتنسيق قوام مع تعزيز معدل الحرق'),
  weight: z.string().max(20).optional().default(''),
  targetWeight: z.string().max(20).optional().default(''),
  bodyFatPercent: z.string().max(20).optional().default(''),
  muscleMass: z.string().max(20).optional().default(''),
  waterPercent: z.string().max(20).optional().default(''),
  breakfast: z.string().max(3000).optional().default(''),
  snack1: z.string().max(3000).optional().default(''),
  lunch: z.string().max(3000).optional().default(''),
  snack2: z.string().max(3000).optional().default(''),
  dinner: z.string().max(3000).optional().default(''),
  waterIntake: z.string().max(1000).optional().default(''),
  supplements: z.string().max(2000).optional().default(''),
  instructions: z.string().max(3000).optional().default(''),
});

router.get('/prescriptions', async (req, res) => {
  const { search } = z.object({ search: z.string().max(100).default('') }).parse(req.query);
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rows = await Prescription.find({
    ...(search
      ? {
          $or: [
            { patientName: { $regex: escaped, $options: 'i' } },
            { patientPhone: { $regex: escaped } },
          ],
        }
      : {}),
  })
    .sort({ date: -1, createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ prescriptions: rows.map(prescriptionPublic) });
});

router.post('/prescriptions', async (req, res) => {
  const data = prescriptionInputSchema.parse(req.body);
  let linkedUserId: mongoose.Types.ObjectId | null = null;
  const rawPhone = data.patientPhone?.trim() || '';
  const digitsOnly = rawPhone.replace(/\D/g, '').replace(/^2/, '');
  const phoneCandidates: string[] = [];
  if (rawPhone) phoneCandidates.push(rawPhone);
  if (digitsOnly.length >= 8) {
    phoneCandidates.push('0' + digitsOnly.replace(/^0/, ''));
    phoneCandidates.push('+20' + digitsOnly.replace(/^0/, ''));
    phoneCandidates.push(digitsOnly);
  }

  if (data.userId && /^[a-f\d]{24}$/i.test(data.userId)) {
    linkedUserId = new mongoose.Types.ObjectId(data.userId);
  } else if (phoneCandidates.length) {
    const user = await User.findOne({ phone: { $in: phoneCandidates } }).lean();
    if (user) linkedUserId = user._id;
  }

  // 1. If an ID was provided, update the existing prescription
  if (data.id && /^[a-f\d]{24}$/i.test(data.id)) {
    const updated = await Prescription.findByIdAndUpdate(
      data.id,
      {
        $set: {
          ...data,
          userId: linkedUserId,
        },
      },
      { returnDocument: 'after' },
    );
    if (updated) {
      await audit(req.authUser?._id, 'prescription.update', String(updated._id));
      return res.json(prescriptionPublic(updated.toObject()));
    }
  }

  // 2. Prevent accidental duplicate spamming:
  // If the admin publishes for the same patient on the same day, update that existing prescription!
  const matchConditions: Record<string, unknown>[] = [];
  if (linkedUserId) {
    matchConditions.push({ userId: linkedUserId });
  }
  if (phoneCandidates.length) {
    matchConditions.push({ patientPhone: { $in: phoneCandidates } });
  }
  if (data.patientName && data.patientName.trim()) {
    matchConditions.push({ patientName: data.patientName.trim() });
  }

  if (matchConditions.length > 0) {
    const existingSameDay = await Prescription.findOneAndUpdate(
      {
        date: data.date,
        $or: matchConditions,
      },
      {
        $set: {
          ...data,
          userId: linkedUserId,
        },
      },
      { returnDocument: 'after' },
    );
    if (existingSameDay) {
      await audit(req.authUser?._id, 'prescription.update_sameday', String(existingSameDay._id));
      return res.json(prescriptionPublic(existingSameDay.toObject()));
    }
  }

  // 3. Otherwise create a new prescription document
  const row = await Prescription.create({
    ...data,
    userId: linkedUserId,
  });
  await audit(req.authUser?._id, 'prescription.create', String(row._id));
  res.status(201).json(prescriptionPublic(row.toObject()));
});

router.delete('/prescriptions/:id', async (req, res) => {
  const rxId = id.parse(req.params.id);
  const deleted = await Prescription.findByIdAndDelete(rxId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'الروشتة غير موجودة.');
  await audit(req.authUser?._id, 'prescription.delete', String(rxId));
  res.json({ ok: true });
});
