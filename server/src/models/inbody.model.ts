import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface InBodyRecord {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;
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
  createdAt: Date;
  updatedAt: Date;
}

const inbodySchema = new Schema<InBodyRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    weight: { type: Number, required: true },
    bodyFatPercent: { type: Number },
    muscleMass: { type: Number },
    waterPercent: { type: Number },
    visceralFat: { type: Number },
    waistCm: { type: Number },
    doctorNotes: { type: String },
  },
  schemaOptions,
);

inbodySchema.index({ date: -1, createdAt: -1 });
inbodySchema.index({ userId: 1, date: -1 });
inbodySchema.index({ patientPhone: 1, date: -1 });

export const InBody = mongoose.model<InBodyRecord>('InBody', inbodySchema);
