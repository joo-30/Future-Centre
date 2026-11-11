import express, { Router } from 'express';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { ApiError } from '../../lib/api-error.js';
import { ensureDefaultStories, StoryModel } from '../../models/story.model.js';
import { storyPublic } from '../../presenters/portal.js';

export const router = Router();

const storyInputSchema = z.object({
  name: z.string().trim().min(2, 'الاسم مطلوب (حرفين على الأقل)'),
  title: z.string().trim().min(3, 'العنوان الرئيسي للقصة مطلوب'),
  age: z.coerce.number().min(1).max(120).optional(),
  category: z.string().trim().min(2, 'القسم والتصنيف مطلوب'),
  weightLostKg: z.coerce.number().min(0.5, 'مقدار النزول بالكيلوجرام مطلوب'),
  durationMonths: z.coerce.number().optional(),
  durationText: z.string().trim().min(2, 'المدة الزمنية مطلوبة (مثال: ٣ أشهر)'),
  beforeWeight: z.coerce.number().optional(),
  afterWeight: z.coerce.number().optional(),
  programTitle: z.string().trim().min(2, 'اسم البرنامج أو الكورس مطلوب'),
  quote: z.string().trim().min(5, 'شهادة أو تجربة المريض مطلوبة'),
  details: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  detailsImageUrl: z.string().trim().optional(),
  additionalImages: z.array(z.string().trim()).default([]).optional(),
  storyType: z.enum(['transformation', 'review']).default('transformation'),
  verified: z.boolean().default(true),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.coerce.number().default(0),
});

// Image Upload Endpoint for Clinical Stories & Gallery
router.post('/stories/upload', express.json({ limit: '20mb' }), async (req, res) => {
  const { dataUrl, filename } = req.body || {};
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    throw new ApiError(400, 'INVALID_IMAGE', 'يرجى إرسال صورة بصيغة صالحة (PNG, JPG, WebP).');
  }

  const mimeMatch = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
  if (!mimeMatch) {
    throw new ApiError(400, 'INVALID_IMAGE', 'تنسيق ترميز الصورة غير صالح.');
  }

  const mime = mimeMatch[1];
  const extMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  const ext = extMap[mime] || '.jpg';
  const base64Data = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const uploadsDir = path.resolve('client/public/stories/uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = filename
    ? path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    : 'story_img';
  const newFileName = `${safeName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const filePath = path.join(uploadsDir, newFileName);
  await fs.writeFile(filePath, buffer);

  const distUploads = path.resolve('client/dist/stories/uploads');
  if (existsSync(path.resolve('client/dist'))) {
    await fs.mkdir(distUploads, { recursive: true });
    await fs.writeFile(path.join(distUploads, newFileName), buffer);
  }

  res.json({
    url: `/stories/uploads/${newFileName}`,
    name: newFileName,
    size: buffer.length,
  });
});

router.get('/stories', async (_req, res) => {
  await ensureDefaultStories();
  const stories = await StoryModel.find({})
    .sort({ order: 1, createdAt: -1 })
    .lean();
  res.json({ stories: stories.map(storyPublic) });
});

router.post('/stories', async (req, res) => {
  const data = storyInputSchema.parse(req.body);
  const created = await StoryModel.create(data);
  res.status(201).json({ story: storyPublic(created.toObject()) });
});

router.put('/stories/:id', async (req, res) => {
  const data = storyInputSchema.partial().parse(req.body);
  const updated = await StoryModel.findByIdAndUpdate(
    req.params.id,
    { $set: data },
    { new: true, runValidators: true },
  ).lean();
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'قصة النجاح غير موجودة.');
  res.json({ story: storyPublic(updated) });
});

router.delete('/stories/:id', async (req, res) => {
  const deleted = await StoryModel.findByIdAndDelete(req.params.id).lean();
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'قصة النجاح غير موجودة.');
  res.json({ ok: true, id: req.params.id });
});
