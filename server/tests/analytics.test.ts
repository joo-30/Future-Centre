import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { connectDatabase } from '../src/database/connect.js';
import { Appointment } from '../src/models/appointment.model.js';
import { ArticleModel } from '../src/models/article.model.js';
import { Clinic } from '../src/models/clinic.model.js';
import { ServiceModel } from '../src/models/service.model.js';
import { SubscriptionModel } from '../src/models/subscription.model.js';
import { seed } from '../src/seed.js';

const dbName = 'future_center_analytics_test_' + Date.now();
const uri = `mongodb://127.0.0.1:27027/${dbName}?replicaSet=future-center`;
const app = createApp();

beforeAll(async () => {
  await connectDatabase(uri);
  await seed();
});

afterAll(async () => {
  if (mongoose.connection.name !== dbName || !dbName.startsWith('future_center_analytics_test_'))
    return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

it('reports Cairo-local requests, completed visits per service and net weekly scheduled time', async () => {
  const date = '2026-11-19';
  const hours = Array.from({ length: 7 }, (_, index) => ({
    weekday: index + 1,
    open: index === 3,
    start: '13:00',
    end: '20:00',
    breaks: index === 3 ? [{ start: '15:00', end: '15:45' }] : [],
  }));
  await Clinic.updateOne(
    { key: 'main' },
    {
      $set: {
        hours,
        blocks: [
          { date, start: '15:30', end: '16:00', reason: 'إغلاق' },
          { date, start: '19:30', end: '21:00', reason: 'إغلاق' },
        ],
      },
    },
  );
  await Appointment.insertMany(
    [
      {
        serviceId: 'nutrition',
        serviceTitle: 'تغذية',
        status: 'completed',
        duration: 45,
        createdAt: new Date('2026-11-18T22:10:00Z'),
      },
      {
        serviceId: 'women',
        serviceTitle: 'تغذية المرأة',
        status: 'completed',
        duration: 30,
        createdAt: new Date('2026-11-18T21:50:00Z'),
      },
      {
        serviceId: 'women',
        serviceTitle: 'تغذية المرأة',
        status: 'no_show',
        duration: 90,
        createdAt: new Date('2026-11-19T12:00:00Z'),
      },
    ].map((appointment) => ({
      date,
      reference: randomUUID(),
      idempotencyHash: randomUUID(),
      payloadHash: randomUUID(),
      tokenHash: randomUUID(),
      ...appointment,
    })),
  );
  await SubscriptionModel.insertMany([
    { reference: randomUUID(), startDate: date, endDate: '2026-12-19', status: 'completed' },
    { reference: randomUUID(), startDate: date, endDate: '2026-12-19', status: 'cancelled' },
  ]);

  expect((await request(app).get('/api/admin/analytics')).status).toBe(401);
  const result = await request(app)
    .get('/api/admin/analytics')
    .query({ date })
    .set('X-Admin-Key', config.ADMIN_API_KEY);
  expect(result.status).toBe(200);
  expect(result.body).toMatchObject({
    date,
    weekStart: '2026-11-14',
    weekEnd: '2026-11-20',
    day: { received: 2, booked: 3, completed: 2, noShow: 1 },
    week: { received: 3, subscriptionsStarted: 1 },
  });
  expect(result.body.day.services).toEqual([
    { id: 'women', title: 'تغذية المرأة', booked: 2, completed: 1 },
    { id: 'nutrition', title: 'تغذية', booked: 1, completed: 1 },
  ]);
  expect(result.body.week.days).toContainEqual({
    date,
    scheduledMinutes: 330,
    completed: 2,
    visitMinutes: 75,
  });
});

it('preserves existing clinic hours, edited services and deleted articles on startup', async () => {
  const current = await Clinic.findOne({ key: 'main' }).lean();
  await ServiceModel.updateOne({ id: 'nutrition' }, { $set: { price: 777 } });
  await ArticleModel.deleteOne({ slug: 'meal-planning' });
  await seed();
  const clinic = await Clinic.findOne({ key: 'main' }).lean();
  expect(clinic?.hours).toEqual(current?.hours);
  expect(clinic?.blocks).toEqual(current?.blocks);
  expect((await ServiceModel.findOne({ id: 'nutrition' }).lean())?.price).toBe(777);
  expect(await ArticleModel.exists({ slug: 'meal-planning' })).toBeNull();
});
