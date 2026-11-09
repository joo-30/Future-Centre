import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface SubscriptionRecord {
  _id: mongoose.Types.ObjectId;
  reference: string;
  userId: mongoose.Types.ObjectId | null;
  name: string;
  phone: string;
  programId: string;
  programTitle: string;
  price: number | null;
  sessionsTotal: number;
  sessionsUsed: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  notes: string;
}

const subscriptionSchema = new Schema<SubscriptionRecord>(
  {
    reference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, default: null, index: true },
    name: String,
    phone: String,
    programId: String,
    programTitle: String,
    price: Number,
    sessionsTotal: Number,
    sessionsUsed: Number,
    startDate: String,
    endDate: String,
    status: String,
    notes: { type: String, default: '' },
  },
  schemaOptions,
);

subscriptionSchema.index({ createdAt: -1 });
subscriptionSchema.index({ phone: 1 });

export const SubscriptionModel = mongoose.model<SubscriptionRecord>(
  'Subscription',
  subscriptionSchema,
);
