import { type UserPublic } from '@future/shared';
import { type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { hash } from '../lib/crypto.js';
import { Session } from '../models/session.model.js';
import { User, type UserRecord } from '../models/user.model.js';
import { getNextFileNumber } from '../models/counter.model.js';

export const cookieName = config.NODE_ENV === 'production' ? '__Host-fc_session' : 'fc_session';
export const adminCookieName =
  config.NODE_ENV === 'production' ? '__Host-fc_admin_session' : 'fc_admin_session';

export async function passwordHash(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await derive(password, salt);
  return `scrypt:${salt}:${key.toString('hex')}`;
}

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    crypto.scrypt(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 },
      (e, key) => (e ? reject(e) : resolve(key)),
    ),
  );
}

export async function verify(password: string, encoded: string) {
  const [algorithm, salt, key] = encoded.split(':');
  if (algorithm !== 'scrypt' || !salt || !key) return false;
  const actual = await derive(password, salt);
  const expected = Buffer.from(key, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export const publicUser = (user: UserRecord): UserPublic => ({
  id: String(user._id),
  fileNumber: user.fileNumber,
  name: user.name,
  phone: user.phone,
  role: user.role,
  createdAt: new Date(user.createdAt).toISOString(),
});

export const recoveryCode = () => crypto.randomBytes(24).toString('base64url');

export async function createUser(
  name: string,
  phone: string,
  password: string,
  role: 'patient' | 'admin' = 'patient',
) {
  const code = recoveryCode();
  const fileNumber = role === 'patient' ? await getNextFileNumber() : undefined;
  const user = await User.create({
    name,
    phone,
    passwordHash: await passwordHash(password),
    recoveryHash: hash(code),
    role,
    ...(fileNumber ? { fileNumber } : {}),
  });
  return { user, recoveryCode: code };
}

export function readNamedCookie(req: Request, name: string) {
  const raw = (req.headers.cookie || '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(name + '='));
  return raw?.slice(name.length + 1) || '';
}

export function readCookie(req: Request) {
  return readNamedCookie(req, cookieName);
}

export function readAdminCookie(req: Request) {
  return readNamedCookie(req, adminCookieName);
}

export async function startSession(
  req: Request,
  res: Response,
  user: UserRecord,
  remember = false,
) {
  if (
    req.sessionHash &&
    req.authUser &&
    (String(req.authUser._id) === String(user._id) || req.authUser.role === user.role)
  ) {
    await Session.deleteOne({ tokenHash: req.sessionHash });
  }
  const token = crypto.randomBytes(32).toString('base64url');
  const maxAge = (user.role === 'admin' ? 8 : remember ? 24 * 30 : 24) * 3600000;
  await Session.create({
    tokenHash: hash(token),
    userId: user._id,
    authVersion: user.authVersion || 0,
    expiresAt: new Date(Date.now() + maxAge),
  });

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(remember || user.role === 'admin' ? { maxAge } : {}),
  };

  if (user.role === 'admin') {
    res.cookie(adminCookieName, token, cookieOptions);
    if (!readCookie(req)) {
      res.cookie(cookieName, token, cookieOptions);
    }
  } else {
    res.cookie(cookieName, token, cookieOptions);
  }
}
