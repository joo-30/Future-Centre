import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { connectDatabase } from '../src/database/connect.js';
import { Appointment } from '../src/models/appointment.model.js';
import { Clinic } from '../src/models/clinic.model.js';
import { seed } from '../src/seed.js';

const dbName = 'future_center_capacity_test_' + Date.now();
const uri = `mongodb://127.0.0.1:27027/${dbName}?replicaSet=future-center`;
const app = createApp();

beforeAll(async () => {
  if (!dbName.startsWith('future_center_capacity_test_')) throw new Error('Unsafe test database');
  await connectDatabase(uri);
  await seed();
});

beforeEach(async () => {
  await Appointment.deleteMany({});
  await Clinic.updateOne(
    { key: 'main' },
    {
      $set: {
        'dailyLimit.enabled': true,
        'dailyLimit.maxPatients': 20,
        'dailyLimit.weekdayLimits': {},
        'dailyLimit.dateOverrides': {},
      },
    },
  );
});

afterAll(async () => {
  if (mongoose.connection.name !== dbName || !dbName.startsWith('future_center_capacity_test_')) {
    throw new Error('Refusing unexpected database cleanup');
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Integration & API Response Tests: Daily Capacity & Clinic Hours', () => {
  it('protects /api/admin/capacity with authentication', async () => {
    // Unauthenticated GET
    const unauthGet = await request(app).get('/api/admin/capacity');
    expect(unauthGet.status).toBe(401);

    // Unauthenticated PUT
    const unauthPut = await request(app).put('/api/admin/capacity').send({ maxPatients: 25 });
    expect(unauthPut.status).toBe(401);

    // Wrong Admin Key
    const badKey = await request(app)
      .get('/api/admin/capacity')
      .set('X-Admin-Key', 'invalid-secret-key-1234');
    expect(badKey.status).toBe(401);
  });

  it('fetches capacity data with default 14 days forecast and valid schema', async () => {
    const res = await request(app)
      .get('/api/admin/capacity')
      .set('X-Admin-Key', config.ADMIN_API_KEY);

    expect(res.status).toBe(200);
    expect(res.body.dailyLimit).toBeDefined();
    expect(res.body.dailyLimit.maxPatients).toBe(20);
    expect(res.body.todayStats).toBeDefined();
    expect(res.body.todayStats.limit).toBe(20);
    expect(Array.isArray(res.body.upcomingDays)).toBe(true);
    expect(res.body.upcomingDays).toHaveLength(14);

    // Check schema of individual day items
    const firstDay = res.body.upcomingDays[0];
    expect(firstDay).toHaveProperty('date');
    expect(firstDay).toHaveProperty('weekday');
    expect(firstDay).toHaveProperty('limit');
    expect(firstDay).toHaveProperty('bookedCount');
    expect(firstDay).toHaveProperty('remaining');
    expect(firstDay).toHaveProperty('percent');
    expect(firstDay).toHaveProperty('isOpen');
  });

  it('accurately handles time-series range filters (1, 7, 10, 30, 100 days)', async () => {
    const testRanges = [1, 7, 10, 30, 100];

    for (const days of testRanges) {
      const res = await request(app)
        .get('/api/admin/capacity')
        .query({ days })
        .set('X-Admin-Key', config.ADMIN_API_KEY);

      expect(res.status).toBe(200);
      expect(res.body.forecastDays).toBe(days);
      expect(res.body.upcomingDays).toHaveLength(days);
    }
  });

  it('clamps extreme query days parameters safely (e.g. days=0 -> 1, days=500 -> 120)', async () => {
    const resZero = await request(app)
      .get('/api/admin/capacity')
      .query({ days: 0 })
      .set('X-Admin-Key', config.ADMIN_API_KEY);
    expect(resZero.body.forecastDays).toBe(1);
    expect(resZero.body.upcomingDays).toHaveLength(1);

    const resOverflow = await request(app)
      .get('/api/admin/capacity')
      .query({ days: 500 })
      .set('X-Admin-Key', config.ADMIN_API_KEY);
    expect(resOverflow.body.forecastDays).toBe(120);
    expect(resOverflow.body.upcomingDays).toHaveLength(120);
  });

  it('updates clinic default limit and persists specific date overrides', async () => {
    const targetDate = DateTime.now().setZone('Africa/Cairo').plus({ days: 5 }).toISODate()!;

    // Update capacity settings: default 25, targetDate 35
    const updateRes = await request(app)
      .put('/api/admin/capacity')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({
        enabled: true,
        showToPatients: true,
        maxPatients: 25,
        dateOverrides: {
          [targetDate]: 35,
        },
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.ok).toBe(true);
    expect(updateRes.body.dailyLimit.maxPatients).toBe(25);
    expect(updateRes.body.dailyLimit.dateOverrides[targetDate]).toBe(35);

    // Fetch capacity and verify forecast reflects the override
    const getRes = await request(app)
      .get('/api/admin/capacity')
      .query({ days: 10 })
      .set('X-Admin-Key', config.ADMIN_API_KEY);

    expect(getRes.status).toBe(200);
    const dayItem = getRes.body.upcomingDays.find((d: { date: string }) => d.date === targetDate);
    expect(dayItem).toBeDefined();
    expect(dayItem.limit).toBe(35);
    expect(dayItem.isCustomDate).toBe(true);

    // Check another day: should be default 25
    const otherDay = getRes.body.upcomingDays.find((d: { date: string }) => d.date !== targetDate);
    if (otherDay) {
      expect(otherDay.limit).toBe(25);
      expect(otherDay.isCustomDate).toBe(false);
    }
  });
});
