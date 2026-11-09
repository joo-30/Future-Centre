import { Router } from 'express';
import { DateTime } from 'luxon';
import { Appointment } from '../../models/appointment.model.js';
import { Audit } from '../../models/audit.model.js';
import { Clinic } from '../../models/clinic.model.js';

export const router = Router();

router.get('/capacity', async (req, res) => {
  const clinic = await Clinic.findOne({ key: 'main' }).lean();
  const timezone = clinic?.timezone || 'Africa/Cairo';
  const now = DateTime.now().setZone(timezone);
  const todayStr = now.toISODate()!;
  const rawDays = req.query.days !== undefined ? Number(req.query.days) : 14;
  const requestedDays = Math.max(1, Math.min(120, isNaN(rawDays) ? 14 : rawDays));

  const dailyLimit = clinic?.dailyLimit || {
    enabled: true,
    maxPatients: 12,
    weekdayLimits: {},
    closedMessage:
      'عفواً، اكتمل الحد الأقصى للحجوزات لهذا اليوم لضمان أعلى جودة رعاية لكل مريض. يُرجى اختيار موعد في يوم آخر.',
  };

  // Convert weekdayLimits & dateOverrides Maps if necessary
  const weekdayLimitsObj: Record<string, number> = {};
  if (dailyLimit.weekdayLimits) {
    if (dailyLimit.weekdayLimits instanceof Map) {
      for (const [k, v] of dailyLimit.weekdayLimits.entries()) {
        weekdayLimitsObj[String(k)] = Number(v);
      }
    } else if (typeof dailyLimit.weekdayLimits === 'object') {
      Object.assign(weekdayLimitsObj, dailyLimit.weekdayLimits);
    }
  }

  const dateOverridesObj: Record<string, number> = {};
  if (dailyLimit.dateOverrides) {
    if (dailyLimit.dateOverrides instanceof Map) {
      for (const [k, v] of dailyLimit.dateOverrides.entries()) {
        dateOverridesObj[String(k)] = Number(v);
      }
    } else if (typeof dailyLimit.dateOverrides === 'object') {
      Object.assign(dateOverridesObj, dailyLimit.dateOverrides);
    }
  }

  // Today stats
  const todayWeekday = now.weekday;
  const todayLimit = dateOverridesObj[todayStr] || weekdayLimitsObj[String(todayWeekday)] || dailyLimit.maxPatients || 12;
  const todayBooked = await Appointment.countDocuments({
    date: todayStr,
    status: { $in: ['pending', 'confirmed', 'completed'] },
  });

  const todayStats = {
    date: todayStr,
    weekday: todayWeekday,
    bookedCount: todayBooked,
    limit: todayLimit,
    remaining: Math.max(0, todayLimit - todayBooked),
    percent: Math.min(100, Math.round((todayBooked / todayLimit) * 100)),
    isFull: todayBooked >= todayLimit,
    isCustomDate: Boolean(dateOverridesObj[todayStr]),
    isCustomWeekday: Boolean(weekdayLimitsObj[String(todayWeekday)]),
  };

  // Dynamic rolling window forecast (calculated relative to today every day)
  const startStr = now.toISODate()!;
  const endStr = now.plus({ days: requestedDays - 1 }).toISODate()!;

  // High-performance batch aggregation for fast response even with 100 days
  const bookedCountsByDate = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: startStr, $lte: endStr },
        status: { $in: ['pending', 'confirmed', 'completed'] },
      },
    },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
      },
    },
  ]);

  const bookedMap = new Map<string, number>();
  for (const item of bookedCountsByDate) {
    bookedMap.set(String(item._id), Number(item.count) || 0);
  }

  const upcomingDays = [];
  for (let i = 0; i < requestedDays; i++) {
    const d = now.plus({ days: i });
    const dStr = d.toISODate()!;
    const w = d.weekday;
    const hours = clinic?.hours?.find((h) => h.weekday === w);
    const isOpen = Boolean(hours?.open);
    const dayLimit = dateOverridesObj[dStr] || weekdayLimitsObj[String(w)] || dailyLimit.maxPatients || 12;
    const booked = bookedMap.get(dStr) || 0;

    upcomingDays.push({
      date: dStr,
      weekday: w,
      isOpen,
      bookedCount: booked,
      limit: dayLimit,
      remaining: Math.max(0, dayLimit - booked),
      percent: Math.min(100, Math.round((booked / dayLimit) * 100)),
      isFull: booked >= dayLimit,
      isCustomDate: Boolean(dateOverridesObj[dStr]),
      isCustomWeekday: Boolean(weekdayLimitsObj[String(w)]),
    });
  }

  // Target date stats if a specific future date is requested (e.g. 12/12/2026 or 2027)
  let targetDateStats = null;
  const targetDateParam = typeof req.query.targetDate === 'string' ? req.query.targetDate : null;
  if (targetDateParam && /^\d{4}-\d{2}-\d{2}$/.test(targetDateParam)) {
    const targetDt = DateTime.fromISO(targetDateParam, { zone: timezone });
    if (targetDt.isValid) {
      const tStr = targetDt.toISODate()!;
      const tw = targetDt.weekday;
      const hours = clinic?.hours?.find((h) => h.weekday === tw);
      const isOpen = Boolean(hours?.open);
      const dayLimit = dateOverridesObj[tStr] || weekdayLimitsObj[String(tw)] || dailyLimit.maxPatients || 12;

      const booked = await Appointment.countDocuments({
        date: tStr,
        status: { $in: ['pending', 'confirmed', 'completed'] },
      });

      targetDateStats = {
        date: tStr,
        weekday: tw,
        isOpen,
        bookedCount: booked,
        limit: dayLimit,
        remaining: Math.max(0, dayLimit - booked),
        percent: Math.min(100, Math.round((booked / dayLimit) * 100)),
        isFull: booked >= dayLimit,
        isCustomDate: Boolean(dateOverridesObj[tStr]),
        isCustomWeekday: Boolean(weekdayLimitsObj[String(tw)]),
      };
    }
  }

  res.json({
    dailyLimit: {
      ...dailyLimit,
      weekdayLimits: weekdayLimitsObj,
      dateOverrides: dateOverridesObj,
    },
    todayStats,
    upcomingDays,
    targetDateStats,
    forecastDays: requestedDays,
    clinicHours: clinic?.hours || [],
  });
});

router.put('/capacity', async (req, res) => {
  const { enabled, showToPatients, maxPatients, weekdayLimits, dateOverrides, closedMessage } = req.body;

  const validMax = Math.max(1, Math.min(100, Number(maxPatients) || 12));
  const validLimits: Record<string, number> = {};
  if (weekdayLimits && typeof weekdayLimits === 'object') {
    for (const [k, v] of Object.entries(weekdayLimits)) {
      const num = Number(v);
      if (num > 0 && num <= 100) {
        validLimits[String(k)] = num;
      }
    }
  }

  const validDateOverrides: Record<string, number> = {};
  if (dateOverrides && typeof dateOverrides === 'object') {
    for (const [k, v] of Object.entries(dateOverrides)) {
      const num = Number(v);
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && num > 0 && num <= 100) {
        validDateOverrides[k] = num;
      }
    }
  }

  const updateData = {
    enabled: Boolean(enabled),
    showToPatients: showToPatients === undefined ? true : Boolean(showToPatients),
    maxPatients: validMax,
    weekdayLimits: validLimits,
    dateOverrides: validDateOverrides,
    closedMessage:
      typeof closedMessage === 'string' && closedMessage.trim()
        ? closedMessage.trim()
        : 'عفواً، اكتمل الحد الأقصى للحجوزات لهذا اليوم لضمان أعلى جودة رعاية لكل مريض. يُرجى اختيار موعد في يوم آخر.',
  };

  await Clinic.updateOne(
    { key: 'main' },
    { $set: { dailyLimit: updateData }, $inc: { revision: 1 } },
    { upsert: true }
  );

  await Audit.create({
    actorId: req.authUser?._id,
    action: 'capacity.update',
    target: 'main',
  });

  res.json({ ok: true, dailyLimit: updateData });
});
