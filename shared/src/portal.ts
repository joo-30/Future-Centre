import { AppointmentPublic } from './appointments.js';
import { DayHours } from './catalog.js';

export interface InterestPublic {
  id: string;
  reference: string;
  programId: string;
  programTitle: string;
  name: string;
  phone?: string;
  userId: string | null;
  priceSnapshot: number | null;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

export interface Subscription {
  id: string;
  reference: string;
  userId: string | null;
  name: string;
  phone?: string;
  programId: string;
  programTitle: string;
  price: number | null;
  sessionsTotal: number;
  sessionsUsed: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
}

export interface InBodyRecordPublic {
  id: string;
  userId?: string | null;
  patientName: string;
  patientPhone: string;
  date: string;
  weight: number;
  bodyFatPercent?: number;
  muscleMass?: number;
  waterPercent?: number;
  visceralFat?: number;
  waistCm?: number;
  doctorNotes?: string;
  createdAt?: string;
}

export interface PrescriptionPublic {
  id: string;
  userId?: string | null;
  patientName: string;
  patientPhone: string;
  date: string;
  nextDate?: string;
  age?: string;
  height?: string;
  goal: string;
  weight: string;
  targetWeight: string;
  bodyFatPercent?: string;
  muscleMass?: string;
  waterPercent?: string;
  breakfast: string;
  snack1: string;
  lunch: string;
  snack2: string;
  dinner: string;
  waterIntake: string;
  supplements: string;
  instructions: string;
  createdAt?: string;
}

export interface AccountData {
  appointments: AppointmentPublic[];
  interests: InterestPublic[];
  subscriptions: Subscription[];
  inbody?: InBodyRecordPublic[];
  prescriptions?: PrescriptionPublic[];
}

export interface ScheduleData {
  hours: DayHours[];
  blocks: { date: string; start: string; end: string; reason: string }[];
  demoSchedule: boolean;
}

export interface PatientClinicalNote {
  id: string;
  userId?: string | null;
  patientPhone: string;
  patientName?: string;
  text: string;
  authorName?: string;
  createdAt: string;
}

export interface PatientHistoryAppointment {
  id: string;
  reference: string;
  serviceTitle: string;
  date: string;
  time: string;
  status: string;
  duration: number;
  price: number | null;
}

export interface PatientHistoryMetrics {
  initialWeight: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  weightDelta: number | null;
  latestFatPercent: number | null;
  latestMuscleMass: number | null;
  latestVisceralFat: number | null;
  latestWaistCm: number | null;
  height: number | null;
  bmi: number | null;
  bmiCategory: string | null;
}

export interface PatientHistoryData {
  patient: {
    id?: string | null;
    fileNumber?: number;
    name: string;
    phone: string;
    role?: string;
    createdAt?: string;
  };
  metrics: PatientHistoryMetrics;
  activeSubscription: Subscription | null;
  subscriptions: Subscription[];
  inbodyRecords: InBodyRecordPublic[];
  prescriptions: PrescriptionPublic[];
  appointments: PatientHistoryAppointment[];
  clinicalNotes: PatientClinicalNote[];
}
