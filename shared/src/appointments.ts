import { z } from 'zod';
import { dateSchema, timeSchema } from './dates.js';
import { phoneSchema } from './phone.js';

export const bookingSchema = z
  .object({
    serviceId: z.string().min(1, 'اختاري الخدمة.'),
    date: dateSchema,
    time: timeSchema,
    name: z.string().trim().min(3, 'اكتبي اسمك بالكامل.').max(100),
    phone: phoneSchema,
    whatsapp: z.union([z.literal(''), phoneSchema]).optional(),
    consent: z.boolean().refine(Boolean, 'نحتاج موافقتك على التواصل بخصوص طلبك.'),
  })
  .strict();

export type BookingInput = z.input<typeof bookingSchema>;

export type BookingData = z.output<typeof bookingSchema>;

export const rescheduleSchema = z.object({ date: dateSchema, time: timeSchema }).strict();

export const statuses = [
  'pending',
  'confirmed',
  'rejected',
  'cancelled',
  'expired',
  'completed',
  'no_show',
] as const;

export type AppointmentStatus = (typeof statuses)[number];

export const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'بانتظار الموافقة',
  confirmed: 'مؤكد',
  rejected: 'مرفوض',
  cancelled: 'ملغي',
  expired: 'انتهت مهلة الطلب',
  completed: 'مكتمل',
  no_show: 'لم يحضر',
};

export interface Availability {
  date: string;
  serviceId: string;
  timezone: string;
  slots: {
    time: string;
    available: boolean;
    reason: 'available' | 'booked' | 'blocked' | 'past';
  }[];
  closed: boolean;
  message: string;
  dailyCapacity?: {
    limit: number;
    remaining: number;
    bookedCount: number;
    isFull: boolean;
    showToPatients: boolean;
  };
}

export interface HistoryEvent {
  status: AppointmentStatus;
  at: string;
  message: string;
}

export interface AppointmentPublic {
  reference: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  firstName: string;
  phoneMasked: string;
  price: number | null;
  holdUntil: string | null;
  history: HistoryEvent[];
  reschedule: { date: string; time: string; requestedAt: string } | null;
  canCancel: boolean;
  canReschedule: boolean;
  qrToken?: string;
}

export interface BookingResult {
  appointment: AppointmentPublic;
  trackingToken: string;
  replayed: boolean;
}

export interface AdminAppointment extends AppointmentPublic {
  name: string;
  phone: string;
  whatsapp: string;
  userId: string | null;
  fileNumber?: number;
  createdAt: string;
}
