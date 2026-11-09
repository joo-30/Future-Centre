import type { PrescriptionPublic } from '@future/shared';
import type { InBodyRecord } from '../models/inbody.model.js';
import type { InterestRecord } from '../models/interest.model.js';
import { type SubscriptionRecord } from '../models/subscription.model.js';

export const prescriptionPublic = (p: any): PrescriptionPublic => ({
  id: String(p._id),
  userId: p.userId ? String(p.userId) : null,
  patientName: p.patientName,
  patientPhone: p.patientPhone,
  date: p.date,
  nextDate: p.nextDate || undefined,
  age: p.age || undefined,
  height: p.height || undefined,
  goal: p.goal,
  weight: p.weight || '',
  targetWeight: p.targetWeight || '',
  bodyFatPercent: p.bodyFatPercent || undefined,
  muscleMass: p.muscleMass || undefined,
  waterPercent: p.waterPercent || undefined,
  breakfast: p.breakfast || '',
  snack1: p.snack1 || '',
  lunch: p.lunch || '',
  snack2: p.snack2 || '',
  dinner: p.dinner || '',
  waterIntake: p.waterIntake || '',
  supplements: p.supplements || '',
  instructions: p.instructions || '',
  createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
});

export const inbodyPublic = (r: InBodyRecord) => ({
  id: String(r._id),
  userId: r.userId ? String(r.userId) : null,
  patientName: r.patientName,
  patientPhone: r.patientPhone,
  date: r.date,
  weight: r.weight,
  bodyFatPercent: r.bodyFatPercent,
  muscleMass: r.muscleMass,
  waterPercent: r.waterPercent,
  visceralFat: r.visceralFat,
  waistCm: r.waistCm,
  doctorNotes: r.doctorNotes,
  createdAt: new Date(r.createdAt).toISOString(),
});

export const subscriptionPublic = (s: SubscriptionRecord, admin = false) => ({
  id: String(s._id),
  reference: s.reference,
  userId: s.userId ? String(s.userId) : null,
  name: s.name,
  ...(admin ? { phone: s.phone, notes: s.notes } : {}),
  programId: s.programId,
  programTitle: s.programTitle,
  price: s.price,
  sessionsTotal: s.sessionsTotal,
  sessionsUsed: s.sessionsUsed,
  startDate: s.startDate,
  endDate: s.endDate,
  status: s.status,
});

export function interestPublic(s: InterestRecord, admin = false) {
  return {
    id: String(s._id),
    reference: s.reference,
    programId: s.programId,
    programTitle: s.programTitle,
    userId: s.userId ? String(s.userId) : null,
    name: s.name,
    ...(admin ? { phone: s.phone } : {}),
    priceSnapshot: s.priceSnapshot,
    status: s.status,
    createdAt: new Date(s.createdAt).toISOString(),
  };
}

export const patientNotePublic = (n: any) => ({
  id: String(n._id),
  userId: n.userId ? String(n.userId) : null,
  patientPhone: n.patientPhone,
  patientName: n.patientName || '',
  text: n.text,
  authorName: n.authorName || 'طبيبة المركز',
  createdAt: new Date(n.createdAt).toISOString(),
});

