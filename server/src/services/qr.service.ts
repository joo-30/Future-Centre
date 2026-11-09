import crypto from 'node:crypto';
import { DateTime } from 'luxon';
import { config } from '../config.js';

export interface QrVerificationResult {
  valid: boolean;
  reference?: string;
  isLegacy?: boolean;
  error?: string;
}

/**
 * Generates a versioned, cryptographically signed QR token for an appointment ticket.
 * Format: FC:1:<reference>:<expiresAt>:<hmac-sha256>
 */
export function generateSignedQrToken(
  reference: string,
  appointmentDate?: string,
  appointmentTime?: string,
): string {
  const version = 1;
  const cleanRef = reference.trim().toUpperCase();

  // Calculate expiration: appointment time + 7 days buffer for follow-ups, or 60 days default
  let expiresAt: number;
  if (appointmentDate && appointmentTime) {
    const dt = DateTime.fromISO(`${appointmentDate}T${appointmentTime}`, {
      zone: 'Africa/Cairo',
    });
    if (dt.isValid) {
      // 7 days after the appointment time
      expiresAt = Math.floor(dt.plus({ days: 7 }).toMillis() / 1000);
    } else {
      expiresAt = Math.floor(Date.now() / 1000) + 60 * 86400;
    }
  } else {
    expiresAt = Math.floor(Date.now() / 1000) + 60 * 86400;
  }

  const payload = `${version}:${cleanRef}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', config.QR_SIGNING_SECRET)
    .update(payload)
    .digest('hex');

  return `FC:${version}:${cleanRef}:${expiresAt}:${signature}`;
}

/**
 * Verifies a scanned QR code payload:
 * 1. Validates cryptographic HMAC signature with timingSafeEqual.
 * 2. Validates version and expiration.
 * 3. Enforces 45-day sunset policy for legacy unsigned QR codes.
 * 4. Rejects any arbitrary/unrecognized strings immediately.
 */
export function verifyQrPayload(rawInput: string): QrVerificationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, error: 'رمز الـ QR فارغ.' };
  }

  const trimmed = rawInput.trim();

  // 1. Signed Format: FC:1:<ref>:<expiresAt>:<signature>
  const signedMatch = trimmed.match(/^FC:1:([A-Za-z0-9\-]+):(\d+):([a-f0-9]{64})$/i);
  if (signedMatch) {
    const [, ref, expStr, sig] = signedMatch;
    const expiresAt = parseInt(expStr, 10);
    const nowSec = Math.floor(Date.now() / 1000);

    if (nowSec > expiresAt) {
      return {
        valid: false,
        error: 'انتهت صلاحية تذكرة الحجز (تذكرة منتهية الصلاحية).',
      };
    }

    const payload = `1:${ref.toUpperCase()}:${expiresAt}`;
    const expectedSig = crypto
      .createHmac('sha256', config.QR_SIGNING_SECRET)
      .update(payload)
      .digest('hex');

    const sigBuf = Buffer.from(sig.toLowerCase(), 'hex');
    const expBuf = Buffer.from(expectedSig.toLowerCase(), 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return {
        valid: false,
        error: 'رمز الـ QR غير صالح أو تم التلاعب به (توقيع رقمي غير مطابق).',
      };
    }

    return {
      valid: true,
      isLegacy: false,
      reference: ref.toUpperCase(),
    };
  }

  // 2. Check Sunset Policy for Legacy Codes
  const deployDate = new Date(config.QR_PROD_DEPLOYED_AT);
  const sunsetTimestamp =
    deployDate.getTime() + config.QR_LEGACY_SUNSET_DAYS * 24 * 60 * 60 * 1000;
  const isSunsetExpired = Date.now() > sunsetTimestamp;

  let legacyRef: string | null = null;

  // Legacy Pattern 1: FC-APPT:4466
  if (trimmed.startsWith('FC-APPT:')) {
    legacyRef = trimmed.replace('FC-APPT:', '').trim();
  }
  // Legacy Pattern 2: URL with ?ref= or ?reference=
  else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const refParam = url.searchParams.get('ref') || url.searchParams.get('reference');
      if (refParam) legacyRef = refParam.trim();
    } catch {
      // Invalid URL
    }
  }
  // Legacy Pattern 3: JSON payload e.g. {"reference": "4466"}
  else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed) as { reference?: string; ref?: string };
      if (parsed.reference || parsed.ref) {
        legacyRef = (parsed.reference || parsed.ref)!.trim();
      }
    } catch {
      // Not JSON
    }
  }
  // Legacy Pattern 4: Direct code starting with FC- or standard 4-8 digits/alphanumeric code
  else if (/^FC-[A-Za-z0-9]{3,10}$/i.test(trimmed)) {
    legacyRef = trimmed;
  } else if (/^\d{4,8}$/.test(trimmed)) {
    legacyRef = trimmed;
  }

  if (legacyRef) {
    if (isSunsetExpired) {
      return {
        valid: false,
        error:
          'تم إيقاف العمل بصيغة تذاكر QR القديمة بعد انتهاء فترة السماح (45 يوماً). يرجى فتح تذكرة الحجز من حساب المريض للحصول على الكود المحدث.',
      };
    }

    return {
      valid: true,
      isLegacy: true,
      reference: legacyRef.toUpperCase(),
    };
  }

  // 3. Any other random, external, Wi-Fi, or arbitrary strings are REJECTED
  return {
    valid: false,
    error: 'رمز QR غير صالح أو غير صادر من نظام مركز المستقبل.',
  };
}
