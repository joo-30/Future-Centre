import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export const Audit = mongoose.model(
  'Audit',
  new Schema(
    {
      actorId: Schema.Types.ObjectId,
      action: String,
      target: String,
      at: { type: Date, default: Date.now },
    },
    schemaOptions,
  ),
);
