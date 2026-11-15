import { z } from 'zod';
import { phoneSchema } from './phone.js';

export const NEW_PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(NEW_PASSWORD_MIN_LENGTH, 'استخدمي 8 خانات على الأقل.')
  .max(PASSWORD_MAX_LENGTH, 'الحد الأقصى 128 خانة.');

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
    password: z.string().min(1, 'اكتبي كلمة المرور.').max(PASSWORD_MAX_LENGTH),
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
