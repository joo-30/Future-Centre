import express, { Router } from 'express';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { ApiError } from '../../lib/api-error.js';
import { StoryModel } from '../../models/story.model.js';
import { storyPublic } from '../../presenters/portal.js';

export const router = Router();

const optionalNumber = (min?: number, max?: number) =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }, min !== undefined && max !== undefined
      ? z.number().min(min).max(max).nullable().optional()
      : min !== undefined
        ? z.number().min(min).nullable().optional()
        : z.number().nullable().optional());

const optionalString = (max?: number) =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null;
    return typeof val === 'string' ? val.trim() : String(val).trim();
  }, max !== undefined
      ? z.string().max(max).nullable().optional()
      : z.string().nullable().optional());

const storyInputSchema = z.object({
  name: z.string().trim().min(2, 'الاسم مطلوب (حرفين على الأقل)'),
  title: z.string().trim().default('تجربة موثقة بالمركز'),
  age: optionalNumber(1, 120),
  category: z.string().trim().default('تغذية'),
  weightLostKg: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }, z.number().min(0).default(0)),
  durationMonths: optionalNumber(1),
  durationText: z.string().trim().default('متابعة دورية'),
  beforeWeight: optionalNumber(1),
  afterWeight: optionalNumber(1),
  programTitle: z.string().trim().default('برنامج المتابعة الشاملة'),
  quote: z.string().trim().default('تجربة سريرية ناجحة بالعيادة مع د. رنا الشوري'),
  details: optionalString(),
  imageUrl: optionalString(),
  detailsImageUrl: optionalString(),
  beforeImageUrl: optionalString(2048),
  afterImageUrl: optionalString(2048),
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

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidateRoots = [
    path.resolve(process.cwd()),
    path.resolve(process.cwd(), '..'),
    path.resolve(currentDir, '../../..'),
    path.resolve(currentDir, '../../../..'),
  ];
  let root = process.cwd();
  for (const r of candidateRoots) {
    if (existsSync(path.join(r, 'client', 'public'))) {
      root = r;
      break;
    }
  }

  const safeName = filename
    ? path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    : 'story_img';
  const newFileName = `${safeName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;

  const uploadsDir = path.join(root, 'client/public/stories/uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, newFileName), buffer);

  const distUploads = path.join(root, 'client/dist/stories/uploads');
  if (existsSync(path.join(root, 'client/dist'))) {
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
  const stories = await StoryModel.find({})
    .sort({ order: 1, createdAt: -1 })
    .lean();
  res.json({ stories: stories.map(storyPublic) });
});

router.post('/stories', async (req, res) => {
  const data = storyInputSchema.parse(req.body);
  const docData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      docData[key] = value;
    }
  }
  const created = await StoryModel.create(docData);
  res.status(201).json({ story: storyPublic(created.toObject()) });
});

router.put('/stories/:id', async (req, res) => {
  const data = storyInputSchema.partial().parse(req.body);
  const setOps: Record<string, any> = {};
  const unsetOps: Record<string, 1> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null) {
      unsetOps[key] = 1;
    } else if (value !== undefined) {
      setOps[key] = value;
    }
  }

  const clearable = [
    'age',
    'beforeWeight',
    'afterWeight',
    'durationMonths',
    'beforeImageUrl',
    'afterImageUrl',
    'detailsImageUrl',
    'imageUrl',
  ];
  for (const field of clearable) {
    if (field in req.body && (req.body[field] === '' || req.body[field] === null)) {
      delete setOps[field];
      unsetOps[field] = 1;
    }
  }

  const updateOps: Record<string, any> = {};
  if (Object.keys(setOps).length > 0) updateOps.$set = setOps;
  if (Object.keys(unsetOps).length > 0) updateOps.$unset = unsetOps;

  const updated = await StoryModel.findByIdAndUpdate(
    req.params.id,
    updateOps,
    { returnDocument: 'after' },
  ).lean();
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'قصة النجاح غير موجودة.');
  res.json({ story: storyPublic(updated) });
});

router.delete('/stories/:id', async (req, res) => {
  const deleted = await StoryModel.findByIdAndDelete(req.params.id).lean();
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'قصة النجاح غير موجودة.');
  res.json({ ok: true, id: req.params.id });
});
