import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface PatientNoteRecord {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | null;
  patientPhone: string;
  patientName?: string;
  text: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientNoteSchema = new Schema<PatientNoteRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    patientPhone: { type: String, required: true, index: true },
    patientName: { type: String, default: '' },
    text: { type: String, required: true, trim: true },
    authorName: { type: String, default: 'طبيبة المركز' },
  },
  schemaOptions,
);

patientNoteSchema.index({ patientPhone: 1, createdAt: -1 });
patientNoteSchema.index({ userId: 1, createdAt: -1 });

export const PatientNote = mongoose.model<PatientNoteRecord>('PatientNote', patientNoteSchema);
