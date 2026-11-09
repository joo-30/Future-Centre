import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { connectDatabase } from '../src/database/connect.js';
import { Appointment } from '../src/models/appointment.model.js';
import { Clinic } from '../src/models/clinic.model.js';
import { Interest } from '../src/models/interest.model.js';
import { Reservation } from '../src/models/reservation.model.js';
import { seed } from '../src/seed.js';
const dbName = 'future_center_test_' + Date.now();
const uri = `mongodb://127.0.0.1:27027/${dbName}?replicaSet=future-center`;
const app = createApp();
const nextOpenDate = () => {
  let d = DateTime.now().setZone('Africa/Cairo').plus({ days: 2 });
  while (d.weekday === 5) d = d.plus({ days: 1 });
  return d.toISODate()!;
};
const data = (extra: Record<string, unknown> = {}) => ({
  serviceId: 'nutrition',
  date: nextOpenDate(),
  time: '10:00',
  name: 'عميلة اختبار',
  phone: '01000000001',
  whatsapp: '',
  consent: true,
  ...extra,
});
const book = (body = data(), key = crypto.randomUUID()) =>
  request(app).post('/api/appointments').set('Idempotency-Key', key).send(body);
const admin = (reference: string, body: Record<string, unknown>) =>
  request(app)
    .post(`/api/admin/appointments/${reference}/decision`)
    .set('X-Admin-Key', config.ADMIN_API_KEY)
    .send(body);
beforeAll(async () => {
  if (!dbName.startsWith('future_center_test_')) throw new Error('Unsafe test database');
  await connectDatabase(uri);
  await seed();
});
beforeEach(async () => {
  await Promise.all([
    Appointment.deleteMany({}),
    Reservation.deleteMany({}),
    Interest.deleteMany({}),
  ]);
  await Clinic.updateOne({ key: 'main' }, { $set: { blocks: [] } });
});
afterAll(async () => {
  if (mongoose.connection.name !== dbName || !dbName.startsWith('future_center_test_'))
    throw new Error('Refusing unexpected database cleanup');
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
describe('real MongoDB booking transactions', () => {
  it('saves a guest booking, normalizes Arabic digits, and only returns masked contact data', async () => {
    const r = await book(data({ phone: '٠١٠٠٠٠٠٠٠٠١' }));
    expect(r.status).toBe(201);
    expect(r.body.appointment.status).toBe('pending');
    expect(r.body.trackingToken).toHaveLength(43);
    expect(r.body.appointment.phone).toBeUndefined();
    expect(r.body.appointment.phoneMasked).not.toContain('00000001');
    const saved = await Appointment.findOne({ reference: r.body.appointment.reference }).select(
      '+phone',
    );
    expect(saved?.phone).toBe('+201000000001');
    const track = await request(app)
      .get('/api/appointments/track')
      .set('Authorization', 'Bearer ' + r.body.trackingToken);
    expect(track.status).toBe(200);
    expect(track.body.reference).toBe(r.body.appointment.reference);
    expect(track.body.tokenHash).toBeUndefined();
  });
  it('allows exactly one of eight simultaneous bookings for the same period', async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => book()));
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(7);
    expect(await Appointment.countDocuments()).toBe(1);
    expect(await Reservation.countDocuments()).toBe(6);
  });
  it('replays concurrent retries without duplicate bookings and rejects a changed payload', async () => {
    const key = crypto.randomUUID();
    const [r1, r2] = await Promise.all([book(data(), key), book(data(), key)]);
    expect([r1.status, r2.status].sort()).toEqual([200, 201]);
    expect(r1.body.trackingToken).toBe(r2.body.trackingToken);
    expect(await Appointment.countDocuments()).toBe(1);
    const changed = await book(data({ name: 'اسم مختلف' }), key);
    expect(changed.status).toBe(409);
    expect(changed.body.error.code).toBe('IDEMPOTENCY_MISMATCH');
  });
  it('blocks partially overlapping appointments with different service durations', async () => {
    expect((await book(data({ serviceId: 'women', phone: '01000000001' }))).status).toBe(201);
    const conflict = await book(data({ time: '10:30', phone: '01000000002' }));
    expect(conflict.status).toBe(409);
    expect((await book(data({ time: '11:00', phone: '01000000003' }))).status).toBe(201);
    const slots = await request(app)
      .get('/api/availability')
      .query({ serviceId: 'nutrition', date: nextOpenDate() });
    expect(slots.body.slots.find((s: { time: string }) => s.time === '10:30').reason).toBe(
      'booked',
    );
  });
  it('does not book breaks, past days, closed days or times beyond opening hours', async () => {
    expect((await book(data({ time: '14:00' }))).status).toBe(409);
    expect((await book(data({ time: '18:00' }))).status).toBe(409);
    expect((await book(data({ date: '2020-01-01' }))).status).toBe(409);
    let friday = DateTime.now().setZone('Africa/Cairo').plus({ days: 1 });
    while (friday.weekday !== 5) friday = friday.plus({ days: 1 });
    expect((await book(data({ date: friday.toISODate() }))).status).toBe(409);
  });
  it('releases reservations when the owner cancels, preserving the appointment history', async () => {
    const r = await book();
    const cancel = await request(app)
      .post('/api/appointments/cancel')
      .set('Authorization', 'Bearer ' + r.body.trackingToken);
    expect(cancel.status).toBe(200);
    expect(cancel.body.status).toBe('cancelled');
    expect(cancel.body.history).toHaveLength(2);
    expect(await Reservation.countDocuments()).toBe(0);
    expect((await book()).status).toBe(201);
  });
  it('expires pending holds before returning availability', async () => {
    const r = await book();
    await Appointment.updateOne(
      { reference: r.body.appointment.reference },
      { $set: { holdUntil: new Date(Date.now() - 10000) } },
    );
    const slots = await request(app)
      .get('/api/availability')
      .query({ serviceId: 'nutrition', date: nextOpenDate() });
    expect(slots.body.slots.find((s: { time: string }) => s.time === '10:00').available).toBe(true);
    const a = await Appointment.findOne({ reference: r.body.appointment.reference });
    expect(a?.status).toBe('expired');
    expect(await Reservation.countDocuments()).toBe(0);
  });
  it('preserves the original appointment if a proposed replacement is taken before approval', async () => {
    const a = await book(data({ phone: '01000000004' }));
    const b = await book(data({ time: '11:00', phone: '01000000005' }));
    await admin(a.body.appointment.reference, { action: 'approve' });
    const proposed = await request(app)
      .post('/api/appointments/reschedule')
      .set('Authorization', 'Bearer ' + a.body.trackingToken)
      .send({ date: nextOpenDate(), time: '12:00' });
    expect(proposed.status).toBe(200);
    expect(proposed.body.time).toBe('10:00');
    expect(proposed.body.reschedule.time).toBe('12:00');
    expect(
      (
        await admin(b.body.appointment.reference, {
          action: 'reschedule',
          date: nextOpenDate(),
          time: '12:00',
        })
      ).status,
    ).toBe(200);
    const failed = await admin(a.body.appointment.reference, { action: 'reschedule' });
    expect(failed.status).toBe(409);
    const original = await Appointment.findOne({ reference: a.body.appointment.reference });
    expect(original?.time).toBe('10:00');
    expect(original?.status).toBe('confirmed');
    expect(await Reservation.countDocuments({ appointmentId: original?._id })).toBe(6);
  });
  it('updates approval/rejection explicitly, rejects early completion and protects administrative routes', async () => {
    const r = await book(data({ phone: '01000000006' }));
    expect((await request(app).get('/api/admin/appointments')).status).toBe(401);
    expect((await admin(r.body.appointment.reference, { action: 'approve' })).body.status).toBe(
      'confirmed',
    );
    expect((await admin(r.body.appointment.reference, { action: 'complete' })).status).toBe(409);
    const second = await book(data({ time: '12:30', phone: '01000000007' }));
    expect(
      (
        await admin(second.body.appointment.reference, {
          action: 'reject',
          reason: 'اختاري وقتًا آخر.',
        })
      ).body.status,
    ).toBe('rejected');
    expect(await Reservation.countDocuments()).toBe(6);
  });
  it('requires private tracking tokens and validates contact and consent', async () => {
    expect((await request(app).get('/api/appointments/track')).status).toBe(404);
    expect(
      (
        await request(app)
          .get('/api/appointments/track')
          .set('Authorization', 'Bearer ' + crypto.randomBytes(32).toString('base64url'))
      ).status,
    ).toBe(404);
    expect((await book(data({ phone: '123' }))).status).toBe(400);
    expect((await book(data({ consent: false }))).status).toBe(400);
    expect(await Appointment.countDocuments()).toBe(0);
  });
  it('applies administrative schedule blocks to both availability and new requests', async () => {
    const s = await request(app)
      .get('/api/admin/schedule')
      .set('X-Admin-Key', config.ADMIN_API_KEY);
    const update = await request(app)
      .put('/api/admin/schedule')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({
        ...s.body,
        blocks: [{ date: nextOpenDate(), start: '10:00', end: '11:00', reason: 'فترة غير متاحة' }],
      });
    expect(update.status).toBe(200);
    expect((await book()).status).toBe(409);
    const slots = await request(app)
      .get('/api/availability')
      .query({ serviceId: 'nutrition', date: nextOpenDate() });
    expect(slots.body.slots.find((s: { time: string }) => s.time === '10:00').reason).toBe(
      'blocked',
    );
  });
  it('persists a program-interest request without activating a subscription or taking payment', async () => {
    const r = await request(app)
      .post('/api/interests')
      .send({ programId: 'monthly', name: 'عميلة اختبار', phone: '01000000001', consent: true });
    expect(r.status).toBe(201);
    expect(r.body.reference).toMatch(/^FC-S/);
    expect(await Interest.countDocuments({ status: 'new' })).toBe(1);
    expect(await Appointment.countDocuments()).toBe(0);
  });
});
