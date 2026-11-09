import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  userId?: mongoose.Types.ObjectId | null;
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
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    patientName: { type: String, required: true, trim: true, index: true },
    patientPhone: { type: String, required: true, trim: true, index: true },
    date: { type: String, required: true, index: true },
    nextDate: { type: String, default: '' },
    age: { type: String, default: '' },
    height: { type: String, default: '' },
    goal: { type: String, required: true, trim: true },
    weight: { type: String, default: '' },
    targetWeight: { type: String, default: '' },
    bodyFatPercent: { type: String, default: '' },
    muscleMass: { type: String, default: '' },
    waterPercent: { type: String, default: '' },
    breakfast: { type: String, default: '' },
    snack1: { type: String, default: '' },
    lunch: { type: String, default: '' },
    snack2: { type: String, default: '' },
    dinner: { type: String, default: '' },
    waterIntake: { type: String, default: '' },
    supplements: { type: String, default: '' },
    instructions: { type: String, default: '' },
  },
  { timestamps: true },
);

prescriptionSchema.index({ date: -1, createdAt: -1 });
prescriptionSchema.index({ userId: 1, date: -1 });
prescriptionSchema.index({ patientPhone: 1, date: -1 });
prescriptionSchema.index({ patientName: 1, date: -1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
