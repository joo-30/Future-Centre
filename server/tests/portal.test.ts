import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/database/connect.js';
import { Appointment } from '../src/models/appointment.model.js';
import { ArticleModel } from '../src/models/article.model.js';
import { Clinic } from '../src/models/clinic.model.js';
import { Interest } from '../src/models/interest.model.js';
import { Reservation } from '../src/models/reservation.model.js';
import { ServiceModel } from '../src/models/service.model.js';
import { Session } from '../src/models/session.model.js';
import { SubscriptionModel } from '../src/models/subscription.model.js';
import { User } from '../src/models/user.model.js';
import { seed } from '../src/seed.js';
import { createUser } from '../src/services/auth.service.js';
const dbName = 'future_center_test_portal_' + Date.now();
const app = createApp();
const patient = {
  name: 'عميلة اختبار الحساب',
  phone: '01000000011',
  password: 'Patient secret 123',
  consent: true,
};
const post = (agent: ReturnType<typeof request.agent>, url: string, body: unknown) =>
  agent.post(url).set('X-FC-Request', '1').send(body);
const futureDate = () => {
  let d = DateTime.now().setZone('Africa/Cairo').plus({ days: 3 });
  while (d.weekday === 5) d = d.plus({ days: 1 });
  return d.toISODate()!;
};
const booking = (extra: Record<string, unknown> = {}) => ({
  serviceId: 'nutrition',
  date: futureDate(),
  time: '10:00',
  name: patient.name,
  phone: patient.phone,
  consent: true,
  ...extra,
});
async function signedUp(phone = patient.phone) {
  const agent = request.agent(app);
  const response = await post(agent, '/api/auth/register', { ...patient, phone });
  expect(response.status).toBe(201);
  return { agent, response };
}
async function administrator() {
  await createUser('إدارة اختبار', '+201000000099', 'Administrator secret 123', 'admin');
  const agent = request.agent(app);
  expect(
    (
      await post(agent, '/api/auth/login', {
        phone: '01000000099',
        password: 'Administrator secret 123',
      })
    ).status,
  ).toBe(200);
  return agent;
}
beforeAll(async () => {
  await connectDatabase(`mongodb://127.0.0.1:27027/${dbName}?replicaSet=future-center`);
  await seed();
});
beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Session.deleteMany({}),
    Appointment.deleteMany({}),
    Reservation.deleteMany({}),
    Interest.deleteMany({}),
    SubscriptionModel.deleteMany({}),
  ]);
  await ServiceModel.updateMany({}, { $set: { active: true } });
  await ArticleModel.updateMany({}, { $set: { published: true } });
});
afterAll(async () => {
  if (mongoose.connection.name !== dbName || !dbName.startsWith('future_center_test_'))
    throw new Error('Unsafe cleanup');
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
describe('authenticated patient and administrative workflows', () => {
  it('uses the booked duration for private rescheduling after a service is renamed, shortened and hidden', async () => {
    const { agent } = await signedUp();
    const b = await agent
      .post('/api/appointments')
      .set('X-FC-Request', '1')
      .set('Idempotency-Key', crypto.randomUUID())
      .send(booking({ serviceId: 'women' }));
    expect(b.status).toBe(201);
    expect(
      (
        await request(app)
          .post('/api/appointments')
          .set('Idempotency-Key', crypto.randomUUID())
          .send(booking({ phone: '01000000095', time: '13:00' }))
      ).status,
    ).toBe(201);
    await ServiceModel.updateOne(
      { id: 'women' },
      { $set: { title: 'اسم معدل للخدمة', duration: 30, active: false } },
    );
    const publicSlots = await request(app)
      .get('/api/availability')
      .query({ serviceId: 'women', date: futureDate() });
    expect(publicSlots.body.slots.find((s: { time: string }) => s.time === '12:30').available).toBe(
      true,
    );
    const accountSlots = await agent
      .get(`/api/account/appointments/${b.body.appointment.reference}/availability`)
      .query({ date: futureDate() });
    expect(
      accountSlots.body.slots.find((s: { time: string }) => s.time === '12:30').available,
    ).toBe(false);
    expect(
      accountSlots.body.slots.find((s: { time: string }) => s.time === '10:30').available,
    ).toBe(true);
    const guestSlots = await request(app)
      .get('/api/appointments/availability')
      .set('Authorization', 'Bearer ' + b.body.trackingToken)
      .query({ date: futureDate() });
    expect(guestSlots.body.slots.find((s: { time: string }) => s.time === '12:30').available).toBe(
      false,
    );
    await ServiceModel.updateOne(
      { id: 'women' },
      { $set: { title: 'تغذية المرأة', duration: 45, active: true } },
    );
  });
  it('requires the current password to change credentials and invalidates other signed-in sessions', async () => {
    const { agent } = await signedUp();
    const second = request.agent(app);
    await post(second, '/api/auth/login', { phone: patient.phone, password: patient.password });
    expect(
      (
        await post(agent, '/api/auth/password', {
          currentPassword: 'incorrect',
          password: 'Another password 123',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await post(agent, '/api/auth/password', {
          currentPassword: patient.password,
          password: 'Another password 123',
        })
      ).status,
    ).toBe(200);
    expect((await agent.get('/api/account')).status).toBe(200);
    expect((await second.get('/api/account')).status).toBe(401);
    expect(
      (await post(second, '/api/auth/login', { phone: patient.phone, password: patient.password }))
        .status,
    ).toBe(401);
  });
  it('declines a time-change request without cancelling the original or removing its pending expiry', async () => {
    const b = await request(app)
      .post('/api/appointments')
      .set('Idempotency-Key', crypto.randomUUID())
      .send(booking());
    const before = await Appointment.findOne({ reference: b.body.appointment.reference }).lean();
    await request(app)
      .post('/api/appointments/reschedule')
      .set('Authorization', 'Bearer ' + b.body.trackingToken)
      .send({ date: futureDate(), time: '12:00' });
    const admin = await administrator();
    const decision = await post(
      admin,
      `/api/admin/appointments/${b.body.appointment.reference}/decision`,
      { action: 'decline_change', reason: 'الوقت الأصلي متاح، تواصلي معنا لمقترح آخر.' },
    );
    expect(decision.status).toBe(200);
    expect(decision.body.status).toBe('pending');
    expect(decision.body.time).toBe('10:00');
    expect(decision.body.reschedule).toBeNull();
    expect(decision.body.holdUntil).toBe(before!.holdUntil!.toISOString());
    expect(await Reservation.countDocuments()).toBe(6);
  });
  it('prevents overlaps even if an administrator shifts the opening time off the previous five-minute grid', async () => {
    expect(
      (
        await request(app)
          .post('/api/appointments')
          .set('Idempotency-Key', crypto.randomUUID())
          .send(booking())
      ).status,
    ).toBe(201);
    const date = futureDate();
    const weekday = DateTime.fromISO(date).weekday;
    const clinic = await Clinic.findOne({ key: 'main' }).lean();
    const hours = clinic!.hours.map((h) => (h.weekday === weekday ? { ...h, start: '10:03' } : h));
    await Clinic.updateOne({ key: 'main' }, { $set: { hours } });
    const r = await request(app)
      .post('/api/appointments')
      .set('Idempotency-Key', crypto.randomUUID())
      .send(booking({ time: '10:03' }));
    expect(r.status).toBe(409);
    await Clinic.updateOne({ key: 'main' }, { $set: { hours: clinic!.hours } });
  });
  it('creates patient-only accounts with hashed credentials, opaque cookies and no exposed hashes', async () => {
    const { agent, response } = await signedUp();
    expect(response.body.user.role).toBe('patient');
    expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
    expect(response.headers['set-cookie'][0]).toMatch(/SameSite=Lax/i);
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    const user = await User.findOne({ phone: '+201000000011' })
      .select('+passwordHash +recoveryHash')
      .lean();
    expect(user?.passwordHash).toMatch(/^scrypt:/);
    expect(user?.passwordHash).not.toContain(patient.password);
    expect(user?.recoveryHash).not.toEqual(response.body.recoveryCode);
    expect((await agent.get('/api/auth/me')).body.user.id).toBe(response.body.user.id);
    expect(
      (await post(agent, '/api/auth/register', { ...patient, phone: '01000000012', role: 'admin' }))
        .status,
    ).toBe(400);
  });
  it('rotates sessions, expires them and revokes logout on the server', async () => {
    const { agent } = await signedUp();
    const old = (await Session.findOne({}).lean())!;
    const login = await post(agent, '/api/auth/login', {
      phone: patient.phone,
      password: patient.password,
    });
    expect(login.status).toBe(200);
    expect(await Session.exists({ _id: old._id })).toBeNull();
    await Session.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await agent.get('/api/account')).status).toBe(401);
    await post(agent, '/api/auth/login', { phone: patient.phone, password: patient.password });
    await post(agent, '/api/auth/logout', {});
    expect((await agent.get('/api/auth/me')).body.user).toBeNull();
  });
  it('uses one-time recovery codes, revokes other sessions and rejects incorrect credentials', async () => {
    const { agent, response } = await signedUp();
    const other = request.agent(app);
    await post(other, '/api/auth/login', { phone: patient.phone, password: patient.password });
    expect(
      (await post(other, '/api/auth/login', { phone: patient.phone, password: 'wrong password' }))
        .status,
    ).toBe(401);
    const recovered = await post(agent, '/api/auth/recover', {
      phone: patient.phone,
      recoveryCode: response.body.recoveryCode,
      password: 'Changed secret 456',
    });
    expect(recovered.status).toBe(200);
    expect(recovered.body.recoveryCode).not.toBe(response.body.recoveryCode);
    expect((await other.get('/api/account')).status).toBe(401);
    expect(
      (
        await post(agent, '/api/auth/recover', {
          phone: patient.phone,
          recoveryCode: response.body.recoveryCode,
          password: 'Changed secret 789',
        })
      ).status,
    ).toBe(400);
    expect(
      (await post(other, '/api/auth/login', { phone: patient.phone, password: patient.password }))
        .status,
    ).toBe(401);
    expect(
      (
        await post(other, '/api/auth/login', {
          phone: patient.phone,
          password: 'Changed secret 456',
        })
      ).status,
    ).toBe(200);
  });
  it('rejects cross-origin mutations and denies patient administrative access', async () => {
    const { agent } = await signedUp();
    expect(
      (
        await agent
          .post('/api/auth/profile')
          .set('Origin', 'https://attacker.invalid')
          .send({ name: 'اسم معدل' })
      ).status,
    ).toBe(403);
    expect((await agent.get('/api/admin/services')).status).toBe(401);
    const noHeader = await agent.patch('/api/auth/profile').send({ name: 'اسم معدل' });
    expect(noHeader.status).toBe(403);
    expect(
      (await agent.patch('/api/auth/profile').set('X-FC-Request', '1').send({ name: 'اسم معدل' }))
        .status,
    ).toBe(200);
  });
  it('does not expose matching-phone guest data; requires the private token and disallows ownership theft', async () => {
    const guest = await request(app)
      .post('/api/appointments')
      .set('Idempotency-Key', crypto.randomUUID())
      .send(booking());
    expect(guest.status).toBe(201);
    const { agent } = await signedUp();
    expect((await agent.get('/api/account')).body.appointments).toHaveLength(0);
    expect(
      (
        await post(agent, '/api/account/claim', {
          token: crypto.randomBytes(32).toString('base64url'),
        })
      ).status,
    ).toBe(404);
    expect(
      (await post(agent, '/api/account/claim', { token: guest.body.trackingToken })).status,
    ).toBe(200);
    expect((await agent.get('/api/account')).body.appointments).toHaveLength(1);
    const second = await signedUp('01000000012');
    expect(
      (await post(second.agent, '/api/account/claim', { token: guest.body.trackingToken })).status,
    ).toBe(409);
    expect(
      (
        await post(
          second.agent,
          `/api/account/appointments/${guest.body.appointment.reference}/cancel`,
          {},
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await post(
          agent,
          `/api/account/appointments/${guest.body.appointment.reference}/cancel`,
          {},
        )
      ).body.status,
    ).toBe('cancelled');
  });
  it('links new authenticated bookings and program leads to the owner only', async () => {
    const { agent } = await signedUp();
    const r = await agent
      .post('/api/appointments')
      .set('X-FC-Request', '1')
      .set('Idempotency-Key', crypto.randomUUID())
      .send(booking());
    expect(r.status).toBe(201);
    expect((await agent.get('/api/account')).body.appointments[0].reference).toBe(
      r.body.appointment.reference,
    );
    expect(
      (
        await post(agent, '/api/interests', {
          programId: 'monthly',
          name: patient.name,
          phone: patient.phone,
          consent: true,
        })
      ).status,
    ).toBe(201);
    const data = (await agent.get('/api/account')).body;
    expect(data.interests).toHaveLength(1);
    expect(data.interests[0].phone).toBeUndefined();
    const second = await signedUp('01000000012');
    expect((await second.agent.get('/api/account')).body.interests).toHaveLength(0);
  });
  it('supports admin approval, searching and price changes without rewriting old booking prices', async () => {
    const { agent } = await signedUp();
    const b = await agent
      .post('/api/appointments')
      .set('X-FC-Request', '1')
      .set('Idempotency-Key', crypto.randomUUID())
      .send(booking());
    const admin = await administrator();
    const list = await admin
      .get('/api/admin/booking-list')
      .query({ search: b.body.appointment.reference });
    expect(list.body.total).toBe(1);
    expect(list.body.appointments[0].phone).toBe('+201000000011');
    const approve = await post(
      admin,
      `/api/admin/appointments/${b.body.appointment.reference}/decision`,
      { action: 'approve' },
    );
    expect(approve.body.status).toBe('confirmed');
    const services = (await admin.get('/api/admin/services')).body.services;
    const service = services.find((s: { id: string }) => s.id === 'nutrition');
    const oldPrice = service.price;
    service.price = oldPrice + 100;
    expect(
      (await admin.put('/api/admin/services/nutrition').set('X-FC-Request', '1').send(service))
        .status,
    ).toBe(200);
    expect((await Appointment.findOne({ reference: b.body.appointment.reference }))?.price).toBe(
      oldPrice,
    );
    service.active = false;
    expect(
      (await admin.put('/api/admin/services/nutrition').set('X-FC-Request', '1').send(service))
        .status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/catalog')).body.services.some(
        (s: { id: string }) => s.id === 'nutrition',
      ),
    ).toBe(false);
    expect(
      (
        await request(app)
          .post('/api/appointments')
          .set('Idempotency-Key', crypto.randomUUID())
          .send(booking({ time: '11:00' }))
      ).status,
    ).toBe(404);
  });
  it('manages subscriptions and sessions, validates totals, and keeps private notes out of the patient account', async () => {
    const { agent, response } = await signedUp();
    const admin = await administrator();
    const sub = {
      userId: response.body.user.id,
      name: patient.name,
      phone: patient.phone,
      programId: 'monthly',
      price: 1500,
      sessionsTotal: 4,
      sessionsUsed: 1,
      startDate: futureDate(),
      endDate: DateTime.fromISO(futureDate()).plus({ days: 30 }).toISODate(),
      status: 'active',
      notes: 'ملاحظة إدارية خاصة',
    };
    const saved = await admin
      .put('/api/admin/subscriptions/new')
      .set('X-FC-Request', '1')
      .send(sub);
    expect(saved.status).toBe(200);
    const account = (await agent.get('/api/account')).body;
    expect(account.subscriptions[0].sessionsUsed).toBe(1);
    expect(account.subscriptions[0].notes).toBeUndefined();
    expect(account.subscriptions[0].phone).toBeUndefined();
    expect(
      (
        await admin
          .put(`/api/admin/subscriptions/${saved.body.id}`)
          .set('X-FC-Request', '1')
          .send({ ...sub, sessionsUsed: 5 })
      ).status,
    ).toBe(400);
    expect(
      (await admin.get('/api/admin/audit')).body.events.some(
        (e: { action: string }) => e.action === 'subscription.save',
      ),
    ).toBe(true);
  });
  it('edits publication state and settings without accepting scripts or exposing draft articles', async () => {
    const admin = await administrator();
    const article = (await admin.get('/api/admin/articles')).body.articles[0];
    article.published = false;
    expect(
      (
        await admin
          .put(`/api/admin/articles/${article.slug}`)
          .set('X-FC-Request', '1')
          .send(article)
      ).status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/catalog')).body.articles.some(
        (a: { slug: string }) => a.slug === article.slug,
      ),
    ).toBe(false);
    article.image = 'https://attacker.invalid/tracking.svg';
    expect(
      (
        await admin
          .put(`/api/admin/articles/${article.slug}`)
          .set('X-FC-Request', '1')
          .send(article)
      ).status,
    ).toBe(400);
    const settings = (await admin.get('/api/admin/settings')).body;
    settings.address = 'عنوان اختبار معتمد';
    expect(
      (await admin.put('/api/admin/settings').set('X-FC-Request', '1').send(settings)).status,
    ).toBe(200);
    expect((await request(app).get('/api/catalog')).body.clinic.address).toBe(settings.address);
  });
});
