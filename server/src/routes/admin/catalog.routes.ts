import { Router } from 'express';

import { articleSchema, serviceSchema } from '@future/shared';
import { ApiError } from '../../lib/api-error.js';
import { ArticleModel } from '../../models/article.model.js';
import { ServiceModel } from '../../models/service.model.js';
import { audit } from '../../services/audit.service.js';
export const router = Router();

router.get('/services', async (_req, res) =>
  res.json({ services: await ServiceModel.find({}).select('-_id -createdAt -updatedAt').lean() }),
);

router.put('/services/:id', async (req, res) => {
  const data = serviceSchema.parse(req.body);
  if (data.id !== req.params.id)
    throw new ApiError(400, 'INVALID_ID', 'لا يمكن تغيير معرّف الخدمة.');
  try {
    await ServiceModel.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, runValidators: true },
    );
  } catch (e) {
    if ((e as { code?: number }).code === 11000)
      throw new ApiError(409, 'DUPLICATE_SLUG', 'رابط البرنامج مستخدم بالفعل.');
    throw e;
  }
  await audit(req.authUser?._id, 'service.save', data.id);
  res.json({ ok: true });
});

router.delete('/services/:id', async (req, res) => {
  const result = await ServiceModel.deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'البرنامج غير موجود أو تم حذفه بالفعل.');
  }
  await audit(req.authUser?._id, 'service.delete', req.params.id);
  res.json({ ok: true });
});

router.get('/articles', async (_req, res) =>
  res.json({ articles: await ArticleModel.find({}).select('-_id -createdAt -updatedAt').lean() }),
);

router.put('/articles/:slug', async (req, res) => {
  const data = articleSchema.parse(req.body);
  if (data.slug !== req.params.slug) throw new ApiError(400, 'INVALID_ID', 'الرابط غير صحيح.');
  await ArticleModel.updateOne(
    { slug: data.slug },
    { $set: data },
    { upsert: true, runValidators: true },
  );
  await audit(req.authUser?._id, 'article.save', data.slug);
  res.json({ ok: true });
});

router.delete('/articles/:slug', async (req, res) => {
  const result = await ArticleModel.deleteOne({ slug: req.params.slug });
  if (result.deletedCount === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'المقال غير موجود أو تم حذفه بالفعل.');
  }
  await audit(req.authUser?._id, 'article.delete', req.params.slug);
  res.json({ ok: true });
});
