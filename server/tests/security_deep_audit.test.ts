import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { config } from '../src/config.js';
import { connectDatabase } from '../src/database/connect.js';
import { Appointment } from '../src/models/appointment.model.js';
import { Audit } from '../src/models/audit.model.js';
import { Clinic } from '../src/models/clinic.model.js';
import { InBody } from '../src/models/inbody.model.js';
import { Interest } from '../src/models/interest.model.js';
import { PatientNote } from '../src/models/patient-note.model.js';
import { Prescription } from '../src/models/prescription.model.js';
import { Reservation } from '../src/models/reservation.model.js';
import { User } from '../src/models/user.model.js';
import { seed } from '../src/seed.js';
import { generateSignedQrToken } from '../src/services/qr.service.js';

const dbName = 'future_center_sec_' + Date.now();
const uri = `mongodb://127.0.0.1:27027/${dbName}?replicaSet=future-center`;
const app = createApp();

const nextOpenDate = () => {
  let d = DateTime.now().setZone('Africa/Cairo').plus({ days: 3 });
  while (d.weekday === 5) d = d.plus({ days: 1 });
  return d.toISODate()!;
};

beforeAll(async () => {
  if (!dbName.startsWith('future_center_sec_')) throw new Error('Unsafe test database');
  await connectDatabase(uri);
  await seed();
});

beforeEach(async () => {
  await Promise.all([
    Appointment.deleteMany({}),
    Reservation.deleteMany({}),
    Interest.deleteMany({}),
    InBody.deleteMany({}),
    PatientNote.deleteMany({}),
    Prescription.deleteMany({}),
  ]);
  await Clinic.updateOne({ key: 'main' }, { $set: { blocks: [] } });
});

afterAll(async () => {
  if (mongoose.connection.name !== dbName || !dbName.startsWith('future_center_sec_'))
    throw new Error('Refusing unexpected database cleanup');
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Senior QA Deep Security, Patient Data Isolation & Concurrency Audit', () => {
  it('SEC-01: denies unauthenticated access to all admin routes', async () => {
    const endpoints = [
      { method: 'get', path: '/api/admin/appointments' },
      { method: 'get', path: '/api/admin/overview' },
      { method: 'get', path: '/api/admin/capacity' },
      { method: 'put', path: '/api/admin/capacity' },
      { method: 'get', path: '/api/admin/patients' },
      { method: 'get', path: '/api/admin/inbody' },
      { method: 'get', path: '/api/admin/prescriptions' },
      { method: 'get', path: '/api/admin/settings' },
    ] as const;

    for (const ep of endpoints) {
      const res = await (request(app) as any)[ep.method](ep.path);
      expect(res.status, `Expected 401 on unauthenticated ${ep.method.toUpperCase()} ${ep.path}`).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('SEC-02: isolates patient data and prevents patient from accessing other patients clinical files', async () => {
    // 1. Register Patient A
    const regA = await request(app)
      .post('/api/auth/register')
      .set('Origin', config.CLIENT_ORIGIN)
      .send({
        name: 'مريضة أ',
        phone: '01011111111',
        password: 'StrongPassword123!',
        consent: true,
      });
    expect(regA.status).toBe(201);
    const cookieA = regA.headers['set-cookie']?.[0]?.split(';')[0];
    expect(cookieA).toBeDefined();

    // 2. Patient A tries to access admin InBody records
    const inbodyRes = await request(app)
      .get('/api/admin/inbody')
      .set('Origin', config.CLIENT_ORIGIN)
      .set('Cookie', cookieA);
    expect(inbodyRes.status).toBe(401);
    expect(inbodyRes.body.error.code).toBe('UNAUTHORIZED');

    // 3. Patient A tries to access admin Prescriptions
    const rxRes = await request(app)
      .get('/api/admin/prescriptions')
      .set('Origin', config.CLIENT_ORIGIN)
      .set('Cookie', cookieA);
    expect(rxRes.status).toBe(401);
    expect(rxRes.body.error.code).toBe('UNAUTHORIZED');

    // 4. Patient A tries to access admin Patients directory
    const patientsRes = await request(app)
      .get('/api/admin/patients')
      .set('Origin', config.CLIENT_ORIGIN)
      .set('Cookie', cookieA);
    expect(patientsRes.status).toBe(401);
    expect(patientsRes.body.error.code).toBe('UNAUTHORIZED');
  });

  it('SEC-03: prevents privilege escalation - patient cannot change own role to admin', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .set('Origin', config.CLIENT_ORIGIN)
      .send({
        name: 'مريضة محاولة تصعيد',
        phone: '01022222222',
        password: 'StrongPassword123!',
        consent: true,
      });
    expect(reg.status).toBe(201);
    const cookie = reg.headers['set-cookie']?.[0]?.split(';')[0];

    // Attempt to PATCH role to admin - strict Zod validation must reject with 400
    const patchRes = await request(app)
      .patch('/api/auth/profile')
      .set('Origin', config.CLIENT_ORIGIN)
      .set('Cookie', cookie)
      .send({ role: 'admin', name: 'مريضة محاولة تصعيد معدلة' });

    expect(patchRes.status).toBe(400);

    // Verify in database directly that role is untouched and remains patient
    const userInDb = await User.findById(reg.body.user.id);
    expect(userInDb?.role).toBe('patient');
  });

  it('SEC-04: rejects NoSQL object injection payloads in login and lookup', async () => {
    // 1. Attempt NoSQL injection in login
    const injectLogin = await request(app)
      .post('/api/auth/login')
      .set('Origin', config.CLIENT_ORIGIN)
      .send({
        phone: { $gt: '' },
        password: { $gt: '' },
      });
    expect([400, 401]).toContain(injectLogin.status);

    // 2. Attempt NoSQL injection in guest appointment lookup
    const injectLookup = await request(app)
      .post('/api/appointments/lookup')
      .set('Origin', config.CLIENT_ORIGIN)
      .send({
        phone: { $gt: '' },
        reference: { $gt: '' },
      });
    expect([400, 404]).toContain(injectLookup.status);
  });

  it('SEC-05: protects against cross-origin mutations (CSRF / Origin Check)', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Origin', 'https://malicious-attacker-website.com')
      .send({
        serviceId: 'nutrition',
        date: nextOpenDate(),
        time: '11:00',
        name: 'هجوم خارجي',
        phone: '01033333333',
        consent: true,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INVALID_ORIGIN');
  });

  it('CONC-01: stress test - 10 simultaneous concurrent bookings for the exact same slot allow exactly 1', async () => {
    const date = nextOpenDate();
    const time = '11:30';

    // Spawn 10 simultaneous bookings for the identical slot
    const promises = Array.from({ length: 10 }, (_, idx) =>
      request(app)
        .post('/api/appointments')
        .set('Origin', config.CLIENT_ORIGIN)
        .set('Idempotency-Key', crypto.randomUUID())
        .send({
          serviceId: 'nutrition',
          date,
          time,
          name: `عميلة تنافس ${idx + 1}`,
          phone: `0104444444${idx}`,
          consent: true,
        })
    );

    const responses = await Promise.all(promises);

    const successes = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter((r) => r.status === 409);

    // Exactly ONE must succeed
    expect(successes).toHaveLength(1);
    // The other 9 must be rejected with 409 Conflict
    expect(conflicts).toHaveLength(9);

    // Verify in database
    const bookedInDb = await Appointment.find({ date, time, status: { $ne: 'cancelled' } });
    expect(bookedInDb).toHaveLength(1);
  });

  it('SEC-QR-01: denies unauthenticated access to QR verification endpoint', async () => {
    const res = await request(app)
      .post('/api/admin/appointments/verify-qr')
      .send({ qrData: 'FC-APPT:4466' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('SEC-QR-02: rejects random / arbitrary / Wi-Fi strings with 400 INVALID_QR', async () => {
    const randomWifiString = 'WIFI:S:Guest-Network-Fake;T:WPA;P:RandomPass99999;;';
    const res = await request(app)
      .post('/api/admin/appointments/verify-qr')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({ qrData: randomWifiString });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QR');
  });

  it('SEC-QR-03: returns 404 NOT_FOUND for non-existent identifier and does NOT synthesize fake patient', async () => {
    const res = await request(app)
      .get('/api/admin/patients/WIFI%3AS%3AGuest-Network-Fake/history')
      .set('X-Admin-Key', config.ADMIN_API_KEY);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.patient).toBeUndefined();
  });

  it('SEC-QR-04: successfully verifies cryptographically signed QR token with timingSafeEqual', async () => {
    const date = nextOpenDate();
    const time = '12:00';
    const appt = await Appointment.create({
      reference: 'FC-7890',
      serviceId: 'nutrition',
      serviceTitle: 'كشف واستشارة بالعيادة',
      date,
      time,
      duration: 30,
      status: 'confirmed',
      name: 'مريضة اختبار QR المعتمد',
      phone: '01011112222',
      price: 250,
      tokenHash: crypto.randomBytes(32).toString('hex'),
      payloadHash: crypto.randomBytes(32).toString('hex'),
      idempotencyHash: crypto.randomBytes(32).toString('hex'),
      history: [{ status: 'confirmed', at: new Date(), message: 'حجز مؤكد' }],
    });

    const validSignedToken = generateSignedQrToken(appt.reference, appt.date, appt.time);

    const res = await request(app)
      .post('/api/admin/appointments/verify-qr')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({ qrData: validSignedToken });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.isLegacy).toBe(false);
    expect(res.body.reference).toBe(appt.reference);
    expect(res.body.name).toBe('مريضة اختبار QR المعتمد');
  });

  it('SEC-QR-05: rejects tampered HMAC signature with 400 INVALID_QR', async () => {
    const date = nextOpenDate();
    const time = '12:30';
    await Appointment.create({
      reference: 'FC-8899',
      serviceId: 'nutrition',
      serviceTitle: 'كشف واستشارة بالعيادة',
      date,
      time,
      duration: 30,
      status: 'confirmed',
      name: 'مريضة اختبار تلاعب',
      phone: '01033334444',
      price: 250,
      tokenHash: crypto.randomBytes(32).toString('hex'),
      payloadHash: crypto.randomBytes(32).toString('hex'),
      idempotencyHash: crypto.randomBytes(32).toString('hex'),
      history: [{ status: 'confirmed', at: new Date(), message: 'حجز مؤكد' }],
    });

    const validSignedToken = generateSignedQrToken('FC-8899', date, time);
    // Tamper with the last character of the signature
    const tamperedToken = validSignedToken.slice(0, -1) + (validSignedToken.endsWith('a') ? 'b' : 'a');

    const res = await request(app)
      .post('/api/admin/appointments/verify-qr')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({ qrData: tamperedToken });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QR');
  });

  it('SEC-QR-06: accepts legacy QR ONLY if appointment exists in DB and logs qr.legacy_scan in AuditLog', async () => {
    const date = nextOpenDate();
    const time = '13:00';
    await Appointment.create({
      reference: 'FC-9911',
      serviceId: 'nutrition',
      serviceTitle: 'كشف واستشارة بالعيادة',
      date,
      time,
      duration: 30,
      status: 'confirmed',
      name: 'مريضة تذكرة قديمة',
      phone: '01055556666',
      price: 250,
      tokenHash: crypto.randomBytes(32).toString('hex'),
      payloadHash: crypto.randomBytes(32).toString('hex'),
      idempotencyHash: crypto.randomBytes(32).toString('hex'),
      history: [{ status: 'confirmed', at: new Date(), message: 'حجز مؤكد' }],
    });

    const res = await request(app)
      .post('/api/admin/appointments/verify-qr')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({ qrData: 'FC-APPT:FC-9911' });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.isLegacy).toBe(true);
    expect(res.body.reference).toBe('FC-9911');

    // Verify audit log entry
    const auditRecord = await Audit.findOne({ action: 'qr.legacy_scan', target: 'FC-9911' });
    expect(auditRecord).not.toBeNull();
  });

  it('SEC-QR-07: rejects legacy QR with 404 if appointment does not exist in DB', async () => {
    const res = await request(app)
      .post('/api/admin/appointments/verify-qr')
      .set('X-Admin-Key', config.ADMIN_API_KEY)
      .send({ qrData: 'FC-APPT:NONEXISTENT-9999' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
