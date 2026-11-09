import { arabicDigits, bookingSchema, dateSchema, normalizePhone, rescheduleSchema } from '@future/shared';
import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../../lib/api-error.js';
import { bearer } from '../../lib/http.js';
import { bookingLimiter } from '../../middleware/booking-limiter.js';
import { Appointment } from '../../models/appointment.model.js';
import { publicAppointment } from '../../presenters/appointment.js';
import { appointmentAvailability } from '../../services/booking/availability.js';
import { cancelByToken, requestReschedule } from '../../services/booking/patient-actions.js';
import { createBooking, findByToken } from '../../services/booking/requests.js';
import { expirePending } from '../../services/booking/reservations.js';

export const router = Router();
router.post('/appointments', bookingLimiter, async (req, res) => {
  const key = z.string().uuid().parse(req.get('Idempotency-Key'));
  const data = bookingSchema.parse(req.body);
  const result = await createBooking(
    data,
    key,
    req.authUser?.role === 'patient' ? String(req.authUser._id) : undefined,
  );
  res.set('Cache-Control', 'no-store');
  res.status(result.replayed ? 200 : 201).json(result);
});

function cleanReferenceCandidates(input: string): string[] {
  const ascii = arabicDigits(input.trim());
  const noSymbols = ascii.replace(/^[#№#\s]+/, '').trim().toUpperCase();
  const compact = noSymbols.replace(/\s+/g, '');

  const set = new Set<string>();
  if (input.trim()) set.add(input.trim());
  if (ascii) set.add(ascii);
  if (noSymbols) set.add(noSymbols);
  if (compact) {
    set.add(compact);
    const withoutFc = compact.replace(/^FC-?/, '');
    if (withoutFc) {
      set.add(withoutFc);
      set.add(`FC-${withoutFc}`);
    }
    if (!compact.startsWith('FC-')) {
      set.add(`FC-${compact}`);
    }
  }
  return Array.from(set);
}

router.post('/appointments/lookup', bookingLimiter, async (req, res) => {
  const body = z
    .object({
      reference: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      query: z.string().trim().optional(),
    })
    .refine(
      (data) => Boolean(data.reference?.trim() || data.phone?.trim() || data.query?.trim()),
      'يرجى إدخال رقم الهاتف أو رقم الحجز للمتابعة.',
    )
    .parse(req.body);

  await expirePending();

  const refInput = body.reference?.trim() || '';
  const phoneInput = body.phone?.trim() || '';
  const queryInput = body.query?.trim() || '';

  let candidates: string[] = [];
  let cleanPhone = '';

  if (queryInput) {
    const asciiQuery = arabicDigits(queryInput).replace(/[\s()\-]/g, '');
    if (/^(\+?20|0020)?01[0125]\d{8}$/.test(asciiQuery) || /^01\d{9}$/.test(asciiQuery) || /^\d{10,14}$/.test(asciiQuery)) {
      try {
        cleanPhone = normalizePhone(asciiQuery);
      } catch {
        // ignore
      }
    }
    candidates = cleanReferenceCandidates(queryInput);
  }

  if (refInput) {
    candidates = cleanReferenceCandidates(refInput);
  }

  if (phoneInput) {
    cleanPhone = normalizePhone(phoneInput);
  }

  let filter: Record<string, unknown> = {};

  if (queryInput) {
    const conditions: Array<Record<string, unknown>> = [];
    if (cleanPhone) {
      conditions.push({ phone: cleanPhone });
    }
    if (candidates.length > 0) {
      conditions.push({ reference: { $in: candidates } });
    }
    if (conditions.length === 1) {
      filter = conditions[0];
    } else if (conditions.length > 1) {
      filter = { $or: conditions };
    }
  } else if (candidates.length > 0 && cleanPhone) {
    filter = { reference: { $in: candidates }, phone: cleanPhone };
  } else if (cleanPhone) {
    filter = { phone: cleanPhone };
  } else if (candidates.length > 0) {
    filter = { reference: { $in: candidates } };
  }

  const appointment = await Appointment.findOne(filter)
    .sort({ createdAt: -1 })
    .select('+phone +whatsapp')
    .lean();

  if (!appointment) {
    const errorMsg = cleanPhone && candidates.length === 0
      ? 'لم نتمكن من العثور على أي حجز مسجل برقم الهاتف المدخل. يرجى التأكد من كتابة الرقم بشكل صحيح.'
      : candidates.length > 0 && !cleanPhone
        ? 'لم نتمكن من العثور على حجز يطابق هذا الكود. يرجى التأكد من رقم الحجز.'
        : 'لم نتمكن من العثور على حجز يطابق البيانات المدخلة. يرجى التأكد والمحاولة مجدداً.';

    throw new ApiError(404, 'NOT_FOUND', errorMsg);
  }

  res.set('Cache-Control', 'no-store');
  res.json({
    appointment: publicAppointment(appointment),
  });
});

router.get('/appointments/availability', async (req, res) => {
  const a = await findByToken(bearer(req));
  res.set('Cache-Control', 'no-store');
  res.json(await appointmentAvailability(a, dateSchema.parse(req.query.date)));
});

router.get('/appointments/track', async (req, res) => {
  await expirePending();
  res.set('Cache-Control', 'no-store');
  res.json(publicAppointment(await findByToken(bearer(req))));
});

router.post('/appointments/cancel', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await cancelByToken(bearer(req)));
});

router.post('/appointments/reschedule', async (req, res) => {
  const data = rescheduleSchema.parse(req.body);
  res.set('Cache-Control', 'no-store');
  res.json(await requestReschedule(bearer(req), data.date, data.time));
});
