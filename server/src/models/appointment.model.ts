import type { AppointmentStatus } from '@future/shared';
import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface AppointmentRecord {
  _id: mongoose.Types.ObjectId;
  reference: string;
  userId: mongoose.Types.ObjectId | null;
  idempotencyHash: string;
  payloadHash: string;
  tokenHash: string;
  serviceId: string;
  serviceTitle: string;
  duration: number;
  price: number | null;
  name: string;
  phone: string;
  whatsapp: string;
  date: string;
  time: string;
  startMinute: number;
  endMinute: number;
  status: AppointmentStatus;
  holdUntil: Date | null;
  history: { status: AppointmentStatus; at: Date; message: string; actor: string }[];
  reschedule: { date: string; time: string; requestedAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

const historySchema = new Schema<AppointmentRecord['history'][number]>(
  { status: String, at: Date, message: String, actor: String },
  { _id: false },
);

const rescheduleEntry = new Schema(
  { date: String, time: String, requestedAt: Date },
  { _id: false },
);

const apptSchema = new Schema<AppointmentRecord>(
  {
    reference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, default: null, index: true },
    idempotencyHash: { type: String, required: true, unique: true, select: false },
    payloadHash: { type: String, required: true, select: false },
    tokenHash: { type: String, required: true, unique: true, select: false },
    serviceId: String,
    serviceTitle: String,
    duration: Number,
    price: Number,
    name: String,
    phone: { type: String, select: false },
    whatsapp: { type: String, select: false },
    date: { type: String, index: true },
    time: String,
    startMinute: Number,
    endMinute: Number,
    status: { type: String, index: true },
    holdUntil: Date,
    history: { type: [historySchema], default: [] },
    reschedule: { type: rescheduleEntry, default: null },
  },
  schemaOptions,
);

export const Appointment = mongoose.model<AppointmentRecord>('Appointment', apptSchema);
