import { Router } from 'express';
import { ApiError } from '../../lib/api-error.js';
import { Audit } from '../../models/audit.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { validateHours } from '../../services/booking/policy.js';
import { scheduleSchema } from '../../validation/schedule.js';

export const router = Router();
router.get('/schedule', async (_req, res) => {
  const clinic = await Clinic.findOne({ key: 'main' }).lean();
  res.json({ hours: clinic?.hours, blocks: clinic?.blocks, demoSchedule: clinic?.demoSchedule });
});

router.put('/schedule', async (req, res) => {
  const data = scheduleSchema.parse(req.body);
  validateHours(data.hours);
  for (const b of data.blocks)
    if (b.end <= b.start)
      throw new ApiError(400, 'INVALID_BLOCK', 'نهاية الفترة يجب أن تكون بعد بدايتها.');
  await Clinic.updateOne({ key: 'main' }, { $set: data, $inc: { revision: 1 } });
  await Audit.create({ actorId: req.authUser?._id, action: 'schedule.save', target: 'main' });
  res.json({ ok: true });
});
