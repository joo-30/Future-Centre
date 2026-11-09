import crypto from 'node:crypto';
import { requireUser } from '../middleware/session.js';
import {
  adminCookieName,
  cookieName,
  createUser,
  passwordHash,
  publicUser,
  readAdminCookie,
  readCookie,
  recoveryCode,
  startSession,
  verify,
} from '../services/auth.service.js';

import { Router, type Request } from 'express';

import { rateLimit } from 'express-rate-limit';

import { z } from 'zod';

import { loginSchema, passwordSchema, phoneSchema, registerSchema } from '@future/shared';

import { Session } from '../models/session.model.js';
import { User, type UserRecord } from '../models/user.model.js';
import { Appointment } from '../models/appointment.model.js';
import { SubscriptionModel } from '../models/subscription.model.js';
import { Interest } from '../models/interest.model.js';
import { InBody } from '../models/inbody.model.js';
import { Prescription } from '../models/prescription.model.js';
import { getNextFileNumber } from '../models/counter.model.js';
import { PatientNote } from '../models/patient-note.model.js';

import { ApiError } from '../lib/api-error.js';
import { hash } from '../lib/crypto.js';

import { config } from '../config.js';

export const authRouter = Router();

const limit = rateLimit({
  windowMs: 15 * 60000,
  limit: config.NODE_ENV === 'development' ? 60 : 12,
  skip: () => config.NODE_ENV === 'test',
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    error: { code: 'AUTH_LIMIT', message: 'محاولات كثيرة. انتظري قليلًا ثم حاولي مجددًا.' },
  },
});

authRouter.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

authRouter.get('/me', (req, res) => {
  const isExplicitAdmin = req.query.context === 'admin' || req.get('X-Auth-Context') === 'admin';
  const isExplicitPatient =
    req.query.context === 'patient' || req.get('X-Auth-Context') === 'patient';

  let user: UserRecord | null | undefined = req.authUser;
  if (isExplicitAdmin) {
    user = req.authAdmin || (req.authUser?.role === 'admin' ? req.authUser : undefined);
  } else if (isExplicitPatient) {
    user = req.authPatient || (req.authUser?.role === 'patient' ? req.authUser : undefined);
  }

  res.json({ user: user ? publicUser(user) : null });
});

const localQuickLogin = (req: Request) =>
  config.NODE_ENV === 'development' &&
  ['127.0.0.1', '::1', 'localhost'].includes(config.HOST) &&
  ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress || '');

authRouter.get('/quick-login', (req, res) => {
  if (!localQuickLogin(req))
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المسار غير موجود.' } });
  res.json({ roles: ['admin', 'patient'] });
});

authRouter.post('/quick-login', limit, async (req, res) => {
  if (!localQuickLogin(req)) throw new ApiError(404, 'NOT_FOUND', 'المسار غير موجود.');
  const { role } = z
    .object({ role: z.enum(['admin', 'patient']) })
    .strict()
    .parse(req.body);
  let user = await User.findOne(
    role === 'admin' ? { role: 'admin' } : { localDemoKey: 'quick-patient', role: 'patient' },
  ).lean();
  if (!user && role === 'patient') {
    const password = crypto.randomBytes(32).toString('base64url');
    try {
      user = (
        await User.create({
          fileNumber: await getNextFileNumber(),
          name: 'حساب تجربة المريض',
          phone: '+2010' + crypto.randomInt(10000000, 99999999),
          role: 'patient',
          passwordHash: await passwordHash(password),
          recoveryHash: hash(recoveryCode()),
          localDemoKey: 'quick-patient',
        })
      ).toObject();
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e;
      user = await User.findOne({ localDemoKey: 'quick-patient', role: 'patient' }).lean();
    }
  }
  if (!user) throw new ApiError(409, 'ADMIN_NOT_READY', 'شغّلي أمر إنشاء الإدارة المحلية أولًا.');
  await startSession(req, res, user);
  res.json({ user: publicUser(user) });
});

authRouter.post('/register', limit, async (req, res) => {
  const data = registerSchema.parse(req.body);
  try {
    const result = await createUser(data.name, data.phone, data.password);
    await startSession(req, res, result.user);
    res.status(201).json({ user: publicUser(result.user), recoveryCode: result.recoveryCode });
  } catch (e) {
    if ((e as { code?: number }).code === 11000)
      throw new ApiError(
        409,
        'ACCOUNT_EXISTS',
        'تعذر إنشاء الحساب بهذا الرقم. جرّبي تسجيل الدخول أو استعادة الحساب.',
      );
    throw e;
  }
});

authRouter.post('/login', limit, async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ phone: data.phone }).select('+passwordHash').lean();
  const valid = await verify(
    data.password,
    user?.passwordHash || `scrypt:00000000000000000000000000000000:${'00'.repeat(64)}`,
  );
  if (!user || !valid)
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'رقم الهاتف أو كلمة المرور غير صحيحة.');
  await startSession(req, res, user, data.remember);
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', async (req, res) => {
  const context = (req.body?.context ||
    req.query.context ||
    req.get('X-Auth-Context') ||
    '') as string;
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  if (context === 'all') {
    const adminToken = readAdminCookie(req);
    if (adminToken) await Session.deleteOne({ tokenHash: hash(adminToken) });
    const userToken = readCookie(req);
    if (userToken) await Session.deleteOne({ tokenHash: hash(userToken) });
    res.clearCookie(adminCookieName, cookieOptions);
    res.clearCookie(cookieName, cookieOptions);
  } else if (context === 'admin' || (!context && req.authUser?.role === 'admin' && req.authAdmin)) {
    const adminToken = readAdminCookie(req);
    if (adminToken) await Session.deleteOne({ tokenHash: hash(adminToken) });
    res.clearCookie(adminCookieName, cookieOptions);
    if (req.authUser?.role === 'admin' && !req.authPatient) {
      res.clearCookie(cookieName, cookieOptions);
    }
  } else {
    if (req.sessionHash) await Session.deleteOne({ tokenHash: req.sessionHash });
    res.clearCookie(cookieName, cookieOptions);
  }
  res.json({ ok: true });
});

authRouter.patch('/profile', requireUser, async (req, res) => {
  const { name } = z
    .object({ name: z.string().trim().min(3).max(100) })
    .strict()
    .parse(req.body);
  const user = await User.findByIdAndUpdate(
    req.authUser!._id,
    { $set: { name } },
    { returnDocument: 'after' },
  ).lean();

  if (user) {
    // Sync patient's updated name across their appointments and clinical records
    await Promise.allSettled([
      Appointment.updateMany(
        { $or: [{ userId: user._id }, { phone: user.phone }] },
        { $set: { name, userId: user._id } },
      ),
      SubscriptionModel.updateMany(
        { $or: [{ userId: user._id }, { phone: user.phone }] },
        { $set: { name, userId: user._id } },
      ),
      Interest.updateMany(
        { $or: [{ userId: user._id }, { phone: user.phone }] },
        { $set: { name, userId: user._id } },
      ),
      InBody.updateMany(
        { $or: [{ userId: user._id }, { phone: user.phone }] },
        { $set: { patientName: name, userId: user._id } },
      ),
      Prescription.updateMany(
        { $or: [{ userId: user._id }, { phone: user.phone }] },
        { $set: { patientName: name, userId: user._id } },
      ),
      PatientNote.updateMany(
        { userId: user._id },
        { $set: { patientName: name } },
      ),
    ]);
  }

  res.json({ user: publicUser(user!) });
});

authRouter.post('/password', requireUser, limit, async (req, res) => {
  const data = z
    .object({ currentPassword: z.string().max(128), password: passwordSchema })
    .strict()
    .parse(req.body);
  const user = await User.findById(req.authUser!._id).select('+passwordHash');
  if (!user || !(await verify(data.currentPassword, user.passwordHash)))
    throw new ApiError(400, 'INVALID_PASSWORD', 'كلمة المرور الحالية غير صحيحة.');
  user.passwordHash = await passwordHash(data.password);
  user.authVersion = (user.authVersion || 0) + 1;
  await user.save();
  await Session.deleteMany({ userId: user._id });
  await startSession(req, res, user);
  res.json({ ok: true });
});

authRouter.post('/recover', limit, async (req, res) => {
  const data = z
    .object({
      phone: phoneSchema,
      recoveryCode: z.string().min(1).max(100),
      password: passwordSchema,
    })
    .strict()
    .parse(req.body);
  const nextCode = recoveryCode();
  const user = await User.findOneAndUpdate(
    { phone: data.phone, recoveryHash: hash(data.recoveryCode.trim()) },
    {
      $set: { passwordHash: await passwordHash(data.password), recoveryHash: hash(nextCode) },
      $inc: { authVersion: 1 },
    },
    { returnDocument: 'after' },
  ).lean();
  if (!user)
    throw new ApiError(
      400,
      'RECOVERY_FAILED',
      'بيانات الاستعادة غير صحيحة. استخدمي الرمز الذي حُفظ عند إنشاء الحساب.',
    );
  await Session.deleteMany({ userId: user._id });
  await startSession(req, res, user);
  res.json({ user: publicUser(user), recoveryCode: nextCode });
});
