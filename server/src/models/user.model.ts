import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface UserRecord {
  _id: mongoose.Types.ObjectId;
  fileNumber?: number;
  name: string;
  phone: string;
  role: 'patient' | 'admin';
  passwordHash: string;
  recoveryHash: string;
  authVersion: number;
  localDemoKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>(
  {
    fileNumber: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    role: { type: String, enum: ['patient', 'admin'], default: 'patient', index: true },
    passwordHash: { type: String, required: true, select: false },
    recoveryHash: { type: String, required: true, select: false },
    authVersion: { type: Number, default: 0 },
    localDemoKey: { type: String, unique: true, sparse: true },
  },
  schemaOptions,
);

userSchema.index({ role: 1, createdAt: -1 });

export const User = mongoose.model<UserRecord>('User', userSchema);
