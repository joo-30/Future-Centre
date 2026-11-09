import type { Service } from '@future/shared';
import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export const ServiceModel = mongoose.model<Service>(
  'Service',
  new Schema<Service>(
    {
      id: { type: String, unique: true, required: true },
      slug: { type: String, unique: true, required: true },
      title: String,
      description: String,
      price: Number,
      duration: Number,
      sessions: Number,
      period: String,
      icon: String,
      featured: Boolean,
      active: { type: Boolean, default: true },
      includes: [String],
      body: [String],
    },
    schemaOptions,
  ),
);
