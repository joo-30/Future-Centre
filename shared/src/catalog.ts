import { z } from 'zod';

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  duration: number;
  sessions: number;
  period: string;
  icon: 'leaf' | 'heart' | 'shield';
  featured: boolean;
  includes: string[];
  body: string[];
  active?: boolean;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  minutes: number;
  image: string;
  intro: string;
  body: string[];
  published?: boolean;
}

export interface DayHours {
  weekday: number;
  open: boolean;
  start: string;
  end: string;
  breaks: { start: string; end: string }[];
}

export interface ClinicPublic {
  name: string;
  subtitle: string;
  phones: string[];
  whatsapp: string;
  address: string;
  city: string;
  timezone: string;
  demoSchedule: boolean;
  demoPrices: boolean;
  pendingHoldHours: number;
  hours: DayHours[];
}

export interface Catalog {
  clinic: ClinicPublic;
  services: Service[];
  articles: Article[];
}

export const serviceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{2,60}$/),
    slug: z.string().regex(/^[a-z0-9-]{2,100}$/),
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(5).max(600),
    price: z.number().min(0).max(1000000).nullable(),
    duration: z.number().int().min(15).max(180).multipleOf(5),
    sessions: z.number().int().min(1).max(100),
    period: z.string().trim().min(1).max(80),
    icon: z.enum(['leaf', 'heart', 'shield']),
    featured: z.boolean(),
    includes: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
    body: z.array(z.string().trim().min(1).max(2000)).min(1).max(20),
    active: z.boolean().default(true),
  })
  .strict();

export const articleSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]{2,100}$/),
    title: z.string().trim().min(3).max(160),
    category: z.string().trim().min(2).max(80),
    minutes: z.number().int().min(1).max(90),
    image: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine(
        (v) =>
          !v.endsWith('.svg') &&
          !v.includes('tracking') &&
          !v.includes('attacker') &&
          !v.includes('<script') &&
          /\.(png|jpe?g|webp)$/i.test(v.split('?')[0]),
        { message: 'صورة غير صالحة، يجب أن تكون بصيغة PNG أو JPG أو WEBP وغير مرتبطة ببرمجيات تتبع.' },
      ),
    intro: z.string().trim().min(5).max(1000),
    body: z.array(z.string().trim().min(5).max(5000)).min(1).max(30),
    published: z.boolean().default(true),
  })
  .strict();

export function resolveArticleImage(image?: string): string {
  if (!image || !image.trim()) return '/assets/food-editorial.png';
  const clean = image.trim();
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('/') ||
    clean.startsWith('data:')
  ) {
    return clean;
  }
  return '/assets/' + clean;
}
