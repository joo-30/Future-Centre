import { z } from 'zod';

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'اختاري يومًا صحيحًا.');

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'اختاري وقتًا صحيحًا.');
