import { dateSchema, type ClinicAnalytics } from '@future/shared';
import { Router } from 'express';
import { DateTime } from 'luxon';
import { ApiError } from '../../lib/api-error.js';
import { Appointment } from '../../models/appointment.model.js';
import { Clinic, type ClinicRecord } from '../../models/clinic.model.js';
import { SubscriptionModel } from '../../models/subscription.model.js';
import { minutes } from '../../services/booking/policy.js';

export const router = Router();

function scheduledMinutes(clinic: ClinicRecord, date: DateTime, iso: string) {
  const hours = clinic.hours.find((day) => day.weekday === date.weekday);
  if (!hours?.open) return 0;
  const start = minutes(hours.start);
  const end = minutes(hours.end);
  const closures = [...hours.breaks, ...clinic.blocks.filter((block) => block.date === iso)]
    .map((block) => ({
      start: Math.max(start, minutes(block.start)),
      end: Math.min(end, minutes(block.end)),
    }))
    .filter((block) => block.start < block.end)
    .sort((a, b) => a.start - b.start);
  let available = end - start;
  let cursor = start;
  for (const block of closures) {
    available -= Math.max(0, block.end - Math.max(cursor, block.start));
    cursor = Math.max(cursor, block.end);
  }
  return Math.max(0, available);
}

router.get('/analytics', async (req, res) => {
  const clinic = await Clinic.findOne({ key: 'main' }).lean();
  if (!clinic) throw new ApiError(404, 'CLINIC_NOT_FOUND', 'إعدادات العيادة غير متاحة.');

  const today = DateTime.now().setZone(clinic.timezone).startOf('day');
  const chosen =
    req.query.date === undefined
      ? today
      : DateTime.fromISO(dateSchema.parse(req.query.date), { zone: clinic.timezone });
  const date = chosen.toISODate();
  if (!date) throw new ApiError(400, 'INVALID_DATE', 'اختاري يومًا صحيحًا.');

  const rangeRaw = req.query.range;
  const rangeType: 'today' | 'week' | 'month' =
    rangeRaw === 'today' || rangeRaw === 'month' ? rangeRaw : 'week';

  // Week boundaries (backward compatibility)
  const weekStartDT = chosen.minus({ days: (chosen.weekday + 1) % 7 });
  const weekEndDT = weekStartDT.plus({ days: 6 });
  const weekStart = weekStartDT.toISODate()!;
  const weekEnd = weekEndDT.toISODate()!;

  // Period boundaries according to requested range
  let periodStartDT = weekStartDT;
  let periodEndDT = weekEndDT;
  if (rangeType === 'today') {
    periodStartDT = chosen;
    periodEndDT = chosen;
  } else if (rangeType === 'month') {
    periodStartDT = chosen.startOf('month');
    periodEndDT = chosen.endOf('month');
  }
  const periodStart = periodStartDT.toISODate()!;
  const periodEnd = periodEndDT.toISODate()!;

  const queryMin = weekStart < periodStart ? weekStart : periodStart;
  const queryMax = weekEnd > periodEnd ? weekEnd : periodEnd;

  const receivedDuring = (first: DateTime, last: DateTime) =>
    Appointment.countDocuments({
      createdAt: { $gte: first.toJSDate(), $lt: last.plus({ days: 1 }).toJSDate() },
    });

  const [appointments, subscriptions, receivedDay, receivedWeek, subscriptionsActive] =
    await Promise.all([
      Appointment.find({ date: { $gte: queryMin, $lte: queryMax } })
        .select('date serviceId serviceTitle duration status price -_id')
        .lean(),
      SubscriptionModel.find({
        startDate: { $gte: queryMin, $lte: queryMax },
        status: { $nin: ['pending', 'cancelled'] },
      })
        .select('startDate price status -_id')
        .lean(),
      receivedDuring(chosen, chosen),
      receivedDuring(weekStartDT, weekEndDT),
      SubscriptionModel.countDocuments({
        status: 'active',
        startDate: { $lte: today.toISODate() },
        endDate: { $gte: today.toISODate() },
      }),
    ]);

  const subscriptionsStarted = subscriptions.filter(
    (s) => s.startDate >= weekStart && s.startDate <= weekEnd,
  ).length;

  // Day specific calculations
  const dayAppointments = appointments.filter((appointment) => appointment.date === date);
  const dayCompleted = dayAppointments.filter((appointment) => appointment.status === 'completed');
  const dayCounts = new Map<string, ClinicAnalytics['day']['services'][number]>();
  for (const appointment of dayAppointments) {
    const id = appointment.serviceId;
    const entry = dayCounts.get(id) ?? {
      id,
      title: appointment.serviceTitle,
      booked: 0,
      completed: 0,
    };
    entry.booked++;
    if (appointment.status === 'completed') entry.completed++;
    dayCounts.set(id, entry);
  }

  // Period specific calculations
  const periodAppointments = appointments.filter(
    (a) => a.date >= periodStart && a.date <= periodEnd,
  );
  const periodCompleted = periodAppointments.filter((a) => a.status === 'completed');
  const periodConfirmed = periodAppointments.filter((a) => a.status === 'confirmed');
  const periodPending = periodAppointments.filter((a) => a.status === 'pending');
  const periodNoShow = periodAppointments.filter((a) => a.status === 'no_show');

  // Revenue for period: ONLY completed visits count as realized revenue, plus started subscriptions
  const periodApptRevenue = periodCompleted.reduce(
    (sum, a) => sum + (typeof a.price === 'number' ? a.price : 0),
    0,
  );
  const periodExpectedApptRevenue = periodConfirmed.reduce(
    (sum, a) => sum + (typeof a.price === 'number' ? a.price : 0),
    0,
  );
  const periodSubs = subscriptions.filter(
    (s) => s.startDate >= periodStart && s.startDate <= periodEnd,
  );
  const periodSubRevenue = periodSubs.reduce(
    (sum, s) => sum + (typeof s.price === 'number' ? s.price : 0),
    0,
  );
  const periodRevenue = periodApptRevenue + periodSubRevenue;

  const periodCounts = new Map<string, ClinicAnalytics['day']['services'][number]>();
  for (const appointment of periodAppointments) {
    const id = appointment.serviceId;
    const entry = periodCounts.get(id) ?? {
      id,
      title: appointment.serviceTitle,
      booked: 0,
      completed: 0,
    };
    entry.booked++;
    if (appointment.status === 'completed') entry.completed++;
    periodCounts.set(id, entry);
  }

  const daysDiff = Math.max(1, Math.round(periodEndDT.diff(periodStartDT, 'days').days) + 1);
  const periodDays = Array.from({ length: daysDiff }, (_, index) => {
    const day = periodStartDT.plus({ days: index });
    const iso = day.toISODate()!;
    const dayAppts = appointments.filter((a) => a.date === iso);
    const visits = dayAppts.filter((a) => a.status === 'completed');
    const dayConfirmed = dayAppts.filter((a) => a.status === 'confirmed');
    // Realized revenue strictly counts attended/completed visits:
    const dayApptRev = visits.reduce(
      (sum, a) => sum + (typeof a.price === 'number' ? a.price : 0),
      0,
    );
    const dayExpectedApptRev = dayConfirmed.reduce(
      (sum, a) => sum + (typeof a.price === 'number' ? a.price : 0),
      0,
    );
    const daySubs = subscriptions.filter((s) => s.startDate === iso);
    const daySubRev = daySubs.reduce(
      (sum, s) => sum + (typeof s.price === 'number' ? s.price : 0),
      0,
    );
    return {
      date: iso,
      scheduledMinutes: scheduledMinutes(clinic, day, iso),
      completed: visits.length,
      booked: dayAppts.length,
      visitMinutes: visits.reduce((sum, a) => sum + (a.duration || 0), 0),
      revenue: dayApptRev + daySubRev,
      expectedRevenue: dayExpectedApptRev,
    };
  });

  const result: ClinicAnalytics = {
    date,
    today: today.toISODate()!,
    weekStart,
    weekEnd,
    timezone: clinic.timezone,
    demoSchedule: clinic.demoSchedule,
    day: {
      received: receivedDay,
      booked: dayAppointments.length,
      completed: dayCompleted.length,
      pending: dayAppointments.filter((appointment) => appointment.status === 'pending').length,
      confirmed: dayAppointments.filter((appointment) => appointment.status === 'confirmed').length,
      noShow: dayAppointments.filter((appointment) => appointment.status === 'no_show').length,
      services: [...dayCounts.values()].sort(
        (a, b) => b.completed - a.completed || b.booked - a.booked,
      ),
    },
    week: {
      received: receivedWeek,
      subscriptionsStarted,
      subscriptionsActive,
      days: Array.from({ length: 7 }, (_, index) => {
        const day = weekStartDT.plus({ days: index });
        const iso = day.toISODate()!;
        const dayAppts = appointments.filter((a) => a.date === iso);
        const visits = dayAppts.filter((a) => a.status === 'completed');
        return {
          date: iso,
          scheduledMinutes: scheduledMinutes(clinic, day, iso),
          completed: visits.length,
          booked: dayAppts.length,
          visitMinutes: visits.reduce((sum, appointment) => sum + (appointment.duration || 0), 0),
        };
      }),
    },
    period: {
      range: rangeType,
      startDate: periodStart,
      endDate: periodEnd,
      revenue: periodRevenue,
      expectedRevenue: periodExpectedApptRevenue,
      appointmentRevenue: periodApptRevenue,
      subscriptionRevenue: periodSubRevenue,
      booked: periodAppointments.length,
      completed: periodCompleted.length,
      confirmed: periodConfirmed.length,
      pending: periodPending.length,
      noShow: periodNoShow.length,
      attendanceRate:
        periodAppointments.length > 0
          ? Math.round((periodCompleted.length / periodAppointments.length) * 100)
          : 100,
      services: [...periodCounts.values()].sort(
        (a, b) => b.completed - a.completed || b.booked - a.booked,
      ),
      scheduledMinutes: periodDays.reduce((sum, d) => sum + d.scheduledMinutes, 0),
      visitMinutes: periodDays.reduce((sum, d) => sum + d.visitMinutes, 0),
      days: periodDays,
    },
  };
  res.json(result);
});
