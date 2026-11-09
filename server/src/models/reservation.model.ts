import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface ReservationRecord {
  appointmentId: mongoose.Types.ObjectId;
  provider: string;
  date: string;
  minute: number;
}

const reservationSchema = new Schema<ReservationRecord>(
  {
    appointmentId: { type: Schema.Types.ObjectId, required: true, index: true },
    provider: { type: String, required: true },
    date: { type: String, required: true },
    minute: { type: Number, required: true },
  },
  schemaOptions,
);

reservationSchema.index({ provider: 1, date: 1, minute: 1 }, { unique: true });
export const Reservation = mongoose.model<ReservationRecord>('Reservation', reservationSchema);
