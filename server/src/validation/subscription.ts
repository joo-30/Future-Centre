import { dateSchema, phoneSchema } from '@future/shared';
import { DateTime } from 'luxon';
import { z } from 'zod';

export const id = z.string().regex(/^[a-f\d]{24}$/i);

export const subscriptionSchema = z
  .object({
    userId: id.nullable(),
    name: z.string().trim().min(3).max(100),
    phone: phoneSchema,
    programId: z.string().min(1).max(60),
    price: z.number().min(0).max(1000000).nullable(),
    sessionsTotal: z.number().int().min(1).max(100),
    sessionsUsed: z.number().int().min(0).max(100),
    startDate: dateSchema,
    endDate: dateSchema,
    status: z.enum(['pending', 'active', 'paused', 'completed', 'cancelled']),
    notes: z.string().max(2000).default(''),
  })
  .strict()
  .refine(
    (v) =>
      v.sessionsUsed <= v.sessionsTotal &&
      v.endDate >= v.startDate &&
      DateTime.fromISO(v.startDate).isValid &&
      DateTime.fromISO(v.endDate).isValid,
    { message: 'راجعي التواريخ وعدد الجلسات المستخدمة.' },
  );
