import type { Availability, DayHours } from '@future/shared';
import { DateTime } from 'luxon';
import { ApiError } from '../../lib/api-error.js';
import { type ClinicRecord } from '../../models/clinic.model.js';

export const minutes = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export const timeString = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const overlap = (a: number, b: number, c: number, d: number) => a < d && b > c;

export const cells = (start: number, end: number) =>
  Array.from(
    { length: Math.ceil(end / 5) - Math.floor(start / 5) },
    (_, i) => Math.floor(start / 5) * 5 + i * 5,
  );

export function slotPolicy(
  clinic: ClinicRecord,
  date: string,
  time: string,
  duration: number,
  now = DateTime.now(),
): { ok: boolean; reason: Availability['slots'][number]['reason'] } {
  const day = DateTime.fromISO(date, { zone: clinic.timezone });
  const today = now.setZone(clinic.timezone).startOf('day');
  const start = minutes(time);
  const end = start + duration;
  if (!day.isValid || day < today || day > today.plus({ days: 90 }))
    return { ok: false, reason: 'past' };
  const instant = DateTime.fromISO(`${date}T${time}`, { zone: clinic.timezone });
  if (!instant.isValid || instant <= now.plus({ minutes: 15 }))
    return { ok: false, reason: 'past' };
  const hours = clinic.hours.find((h) => h.weekday === day.weekday);
  if (
    !hours?.open ||
    start < minutes(hours.start) ||
    end > minutes(hours.end) ||
    (start - minutes(hours.start)) % 30 !== 0
  )
    return { ok: false, reason: 'blocked' };
  if (
    hours.breaks.some((b) => overlap(start, end, minutes(b.start), minutes(b.end))) ||
    clinic.blocks.some(
      (b) => b.date === date && overlap(start, end, minutes(b.start), minutes(b.end)),
    )
  )
    return { ok: false, reason: 'blocked' };
  return { ok: true, reason: 'available' };
}

export function validateHours(hours: DayHours[]) {
  if (hours.length !== 7 || new Set(hours.map((h) => h.weekday)).size !== 7)
    throw new ApiError(400, 'INVALID_SCHEDULE', 'حددي أيام الأسبوع السبعة مرة واحدة.');
  for (const day of hours) {
    if (minutes(day.end) <= minutes(day.start))
      throw new ApiError(400, 'INVALID_SCHEDULE', 'وقت نهاية العمل يجب أن يكون بعد بدايته.');
    for (const b of day.breaks) {
      if (
        minutes(b.end) <= minutes(b.start) ||
        minutes(b.start) < minutes(day.start) ||
        minutes(b.end) > minutes(day.end)
      )
        throw new ApiError(400, 'INVALID_SCHEDULE', 'راجعي أوقات الاستراحة داخل وقت العمل.');
    }
  }
}
