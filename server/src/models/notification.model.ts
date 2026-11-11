import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId | null;
  patientPhone: string;
  type: 'prescription' | 'appointment' | 'inbody' | 'subscription' | 'system';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  readAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    patientPhone: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['prescription', 'appointment', 'inbody', 'subscription', 'system'],
      default: 'system',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    link: { type: String, default: '/account' },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ patientPhone: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
