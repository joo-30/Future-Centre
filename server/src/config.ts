import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { z } from 'zod';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(currentDir, '../.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(currentDir, '../../.env'),
];
for (const p of envPaths) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
  }
}
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().default(5001),
  CLIENT_ORIGIN: z.url().default('http://localhost:5176'),
  PUBLIC_ORIGIN: z.url().default('http://localhost:5176'),
  MONGODB_URI: z.string().min(1),
  TRACKING_SECRET: z.string().min(32),
  ADMIN_API_KEY: z.string().min(32),
  QR_SIGNING_SECRET: z.string().min(32).default(() => process.env.QR_SIGNING_SECRET || process.env.TRACKING_SECRET || 'fc_qr_signing_secret_future_center_prod_safe_min_32_chars'),
  QR_LEGACY_SUNSET_DAYS: z.coerce.number().int().default(45),
  QR_PROD_DEPLOYED_AT: z.string().default(() => process.env.QR_PROD_DEPLOYED_AT || new Date().toISOString().slice(0, 10)),
  PENDING_HOLD_HOURS: z.coerce.number().min(1).max(168).default(24),
  VAPID_PUBLIC_KEY: z.string().default('BD0UbGzUtKZYn1vmxgsuDKIBG_WMmJW3e3hpO33CZRf5g1QSdFFOQRYd08kSHATZ7gmxUEZY0Agsr7ban_kPaLo'),
  VAPID_PRIVATE_KEY: z.string().default('Yy1epHjr5Ij4f2qEUJgx5WgknskTrmMNOIaz_YyNURY'),
  VAPID_SUBJECT: z.string().default('mailto:admin@futurecenter.clinic'),
});
export const config = schema.parse(process.env);
if (
  config.NODE_ENV === 'production' &&
  [config.TRACKING_SECRET, config.ADMIN_API_KEY].some((v) => v.startsWith('replace-'))
)
  throw new Error('Set production secrets before startup.');
