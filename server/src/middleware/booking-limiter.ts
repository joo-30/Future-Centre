import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
export const bookingLimiter = rateLimit({
  windowMs: 3600000,
  limit: config.NODE_ENV === 'development' ? 100 : 20,
  skip: (req) => config.NODE_ENV === 'test' || Boolean(req.authAdmin || req.authUser?.role === 'admin'),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    error: {
      code: 'RATE_LIMIT',
      message: 'وصلتِ للحد المؤقت للطلبات. تواصلي مع المركز أو حاولي لاحقًا.',
    },
  },
});
