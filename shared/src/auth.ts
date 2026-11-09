import { z } from 'zod';
import { phoneSchema } from './phone.js';

export const passwordSchema = z
  .string()
  .min(8, 'استخدمي 8 أحرف على الأقل.')
  .max(128, 'الحد الأقصى 128 حرفًا.');

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'اكتبي اسمك بالكامل.').max(100),
    phone: phoneSchema,
    password: passwordSchema,
    consent: z.boolean().refine(Boolean, 'الموافقة مطلوبة لإنشاء حساب.'),
  })
  .strict();

export const loginSchema = z
  .object({
    phone: phoneSchema,
    password: z.string().min(1, 'اكتبي كلمة المرور.').max(128),
    remember: z.boolean().default(false),
  })
  .strict();

export interface UserPublic {
  id: string;
  fileNumber?: number;
  name: string;
  phone: string;
  role: 'patient' | 'admin';
  createdAt: string;
}
