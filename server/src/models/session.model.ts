import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export const Session = mongoose.model(
  'Session',
  new Schema(
    {
      tokenHash: { type: String, required: true, unique: true },
      userId: { type: Schema.Types.ObjectId, required: true, index: true },
      authVersion: { type: Number, default: 0 },
      expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    schemaOptions,
  ),
);
