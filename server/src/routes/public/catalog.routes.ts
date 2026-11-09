import { dateSchema } from '@future/shared';
import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { config } from '../../config.js';
import { ApiError } from '../../lib/api-error.js';
import { ArticleModel } from '../../models/article.model.js';
import { Clinic } from '../../models/clinic.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { availability } from '../../services/booking/availability.js';

export const router = Router();
router.get('/health', (_req, res) =>
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    ok: mongoose.connection.readyState === 1,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
  }),
);

router.get('/catalog', async (_req, res) => {
  const [clinic, services, articles] = await Promise.all([
    Clinic.findOne({ key: 'main' }).lean(),
    ServiceModel.find({ active: { $ne: false } })
      .select('-_id -createdAt -updatedAt')
      .sort({ featured: -1 })
      .lean(),
    ArticleModel.find({ published: { $ne: false } })
      .select('-_id -createdAt -updatedAt')
      .lean(),
  ]);
  if (!clinic) throw new ApiError(503, 'UNAVAILABLE', 'المركز غير متاح الآن.');
  const { key, blocks, revision, ...publicClinic } = clinic;
  res.json({
    clinic: { ...publicClinic, pendingHoldHours: config.PENDING_HOLD_HOURS },
    services,
    articles,
  });
});

router.get('/availability', async (req, res) => {
  const q = z.object({ serviceId: z.string().min(1).max(60), date: dateSchema }).parse(req.query);
  res.set('Cache-Control', 'no-store');
  res.json(await availability(q.serviceId, q.date));
});
