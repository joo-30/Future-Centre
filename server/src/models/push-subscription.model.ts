import mongoose, { Document, Schema } from 'mongoose';

export interface PushSubscriptionRecord extends Document {
  userId?: mongoose.Types.ObjectId | null;
  patientPhone?: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    patientPhone: { type: String, trim: true, default: '', index: true },
    endpoint: { type: String, required: true, unique: true, index: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

PushSubscriptionSchema.index({ userId: 1, updatedAt: -1 });
PushSubscriptionSchema.index({ patientPhone: 1, updatedAt: -1 });

export const PushSubscription = mongoose.model<PushSubscriptionRecord>(
  'PushSubscription',
  PushSubscriptionSchema,
);
