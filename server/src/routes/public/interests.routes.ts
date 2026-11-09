import { phoneSchema } from '@future/shared';
import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { ApiError } from '../../lib/api-error.js';
import { bookingLimiter } from '../../middleware/booking-limiter.js';
import { Interest } from '../../models/interest.model.js';
import { ServiceModel } from '../../models/service.model.js';

export const router = Router();
router.post('/interests', bookingLimiter, async (req, res) => {
  const data = z
    .object({
      programId: z.string().max(60),
      name: z.string().trim().min(3).max(100),
      phone: phoneSchema,
      consent: z.literal(true),
    })
    .strict()
    .parse(req.body);
  const program = await ServiceModel.findOne({
    id: data.programId,
    active: { $ne: false },
  }).lean();
  if (!program) throw new ApiError(404, 'NOT_FOUND', 'البرنامج غير موجود.');
  const reference = `FC-S${crypto.randomInt(10000, 99999)}`;
  await Interest.create({
    reference,
    userId: req.authUser?.role === 'patient' ? req.authUser._id : null,
    programId: program.id,
    programTitle: program.title,
    name: data.name,
    phone: data.phone,
    priceSnapshot: program.price,
    status: 'new',
  });
  res
    .status(201)
    .json({ reference, message: 'تم حفظ طلب البرنامج. سيتواصل المركز معك لتأكيد التفاصيل.' });
});
