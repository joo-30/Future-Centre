import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface InterestRecord {
  _id: mongoose.Types.ObjectId;
  reference: string;
  userId: mongoose.Types.ObjectId | null;
  programId: string;
  programTitle: string;
  name: string;
  phone: string;
  priceSnapshot: number | null;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const interestSchema = new Schema<InterestRecord>(
  {
    reference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, default: null, index: true },
    programId: { type: String, required: true },
    programTitle: String,
    name: String,
    phone: { type: String, select: false },
    priceSnapshot: Number,
    status: { type: String, default: 'new' },
  },
  schemaOptions,
);

interestSchema.index({ createdAt: -1 });
interestSchema.index({ status: 1, createdAt: -1 });

export const Interest = mongoose.model<InterestRecord>('Interest', interestSchema);
