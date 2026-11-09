import type { RequestHandler } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { hash } from '../lib/crypto.js';
export const requireAdministrativeAccess: RequestHandler = (req, res, next) => {
  const supplied = req.get('X-Admin-Key') || '';
  const a = Buffer.from(hash(supplied));
  const b = Buffer.from(hash(config.ADMIN_API_KEY));
  if (req.authUser?.role !== 'admin' && !crypto.timingSafeEqual(a, b))
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: 'هذا الإجراء يتطلب صلاحية الإدارة.' } });
  res.set('Cache-Control', 'no-store');
  next();
};
