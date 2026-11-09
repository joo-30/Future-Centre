import { type NextFunction, type Request, type Response } from 'express';
import { config } from '../config.js';
import { ApiError } from '../lib/api-error.js';
import { hash } from '../lib/crypto.js';
import { Session } from '../models/session.model.js';
import { User, type UserRecord } from '../models/user.model.js';
import { readAdminCookie, readCookie } from '../services/auth.service.js';

export async function loadSession(req: Request, _res: Response, next: NextFunction) {
  try {
    const userToken = readCookie(req);
    const adminToken = readAdminCookie(req);

    let patientUser: UserRecord | null = null;
    let patientHash = '';
    let adminUser: UserRecord | null = null;
    let adminHash = '';

    // Check user/patient cookie
    if (/^[A-Za-z0-9_-]{43}$/.test(userToken)) {
      const uHash = hash(userToken);
      const session = await Session.findOne({
        tokenHash: uHash,
        expiresAt: { $gt: new Date() },
      }).lean();
      if (session) {
        const user = await User.findById(session.userId).lean();
        if (user && (user.authVersion || 0) === (session.authVersion || 0)) {
          if (user.role === 'admin') {
            adminUser = user;
            adminHash = uHash;
          } else {
            patientUser = user;
            patientHash = uHash;
          }
        }
      }
    }

    // Check admin cookie
    if (/^[A-Za-z0-9_-]{43}$/.test(adminToken)) {
      const aHash = hash(adminToken);
      const session = await Session.findOne({
        tokenHash: aHash,
        expiresAt: { $gt: new Date() },
      }).lean();
      if (session) {
        const user = await User.findById(session.userId).lean();
        if (
          user &&
          user.role === 'admin' &&
          (user.authVersion || 0) === (session.authVersion || 0)
        ) {
          adminUser = user;
          adminHash = aHash;
        }
      }
    }

    req.authPatient = patientUser || undefined;
    req.authAdmin = adminUser || undefined;

    const isAdminRoute = req.originalUrl.startsWith('/api/admin');
    const requestedAdmin =
      req.get('X-Auth-Context') === 'admin' || req.query.context === 'admin';
    const requestedPatient =
      req.get('X-Auth-Context') === 'patient' || req.query.context === 'patient';

    if (isAdminRoute || requestedAdmin) {
      req.authUser = adminUser || patientUser || undefined;
      req.sessionHash = adminHash || patientHash || undefined;
    } else if (requestedPatient) {
      req.authUser = patientUser || undefined;
      req.sessionHash = patientHash || undefined;
    } else {
      req.authUser = patientUser || adminUser || undefined;
      req.sessionHash = patientHash || adminHash || undefined;
    }

    next();
  } catch (e) {
    next(e);
  }
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.authUser) return next(new ApiError(401, 'LOGIN_REQUIRED', 'سجّلي الدخول للمتابعة.'));
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.authUser?.role !== 'admin')
    return next(
      new ApiError(
        req.authUser ? 403 : 401,
        'ADMIN_REQUIRED',
        'هذا الإجراء متاح لإدارة المركز فقط.',
      ),
    );
  next();
}

export function protectOrigin(req: Request, _res: Response, next: NextFunction) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('Origin');
    const allowed = new Set([config.CLIENT_ORIGIN, config.PUBLIC_ORIGIN]);
    if (config.NODE_ENV !== 'production') {
      allowed.add('http://127.0.0.1:5176');
      allowed.add('http://localhost:5176');
      if (
        origin &&
        (origin.endsWith('.trycloudflare.com') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1'))
      ) {
        allowed.add(origin);
      }
    }
    if ((origin && !allowed.has(origin)) || req.get('Sec-Fetch-Site') === 'cross-site')
      return next(new ApiError(403, 'INVALID_ORIGIN', 'افتحي الموقع مباشرة ثم حاولي مرة أخرى.'));
    if (req.sessionHash && !origin && !req.get('X-FC-Request'))
      return next(new ApiError(403, 'INVALID_ORIGIN', 'تعذر التحقق من مصدر الطلب.'));
  }
  next();
}
