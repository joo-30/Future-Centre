import { Router } from 'express';

import { phoneSchema } from '@future/shared';
import { z } from 'zod';
import { Audit } from '../../models/audit.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { audit } from '../../services/audit.service.js';
export const router = Router();

router.get('/settings', async (_req, res) => {
  const c = await Clinic.findOne({ key: 'main' }).lean();
  res.json({
    name: c?.name,
    subtitle: c?.subtitle,
    phones: c?.phones,
    whatsapp: c?.whatsapp,
    address: c?.address,
    city: c?.city,
    demoPrices: c?.demoPrices,
  });
});

router.put('/settings', async (req, res) => {
  const data = z
    .object({
      name: z.string().trim().min(3).max(120),
      subtitle: z.string().trim().min(3).max(120),
      phones: z.array(phoneSchema).min(1).max(4),
      whatsapp: phoneSchema,
      address: z.string().trim().min(5).max(300),
      city: z.string().max(100),
      demoPrices: z.boolean(),
    })
    .strict()
    .parse(req.body);
  await Clinic.updateOne({ key: 'main' }, { $set: data });
  await audit(req.authUser?._id, 'settings.save', 'main');
  res.json({ ok: true });
});

router.get('/audit', async (_req, res) =>
  res.json({ events: await Audit.find({}).sort({ at: -1 }).limit(100).lean() }),
);
