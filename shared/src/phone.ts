import { z } from 'zod';

export const arabicDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));

export const normalizePhone = (value: string) => {
  let p = arabicDigits(value).replace(/[\s()\-]/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (/^01[0125]\d{7,8}$/.test(p)) p = '+20' + p.slice(1);
  if (/^201[0125]\d{7,8}$/.test(p)) p = '+' + p;
  return p;
};

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((v) => /^\+[1-9]\d{7,14}$/.test(v), 'اكتبي رقم هاتف صحيحًا، مثل 01012345678.');
