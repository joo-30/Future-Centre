import type { Article } from '@future/shared';
import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export const ArticleModel = mongoose.model<Article>(
  'Article',
  new Schema<Article>(
    {
      slug: { type: String, unique: true },
      title: String,
      category: String,
      minutes: Number,
      image: String,
      intro: String,
      body: [String],
      published: { type: Boolean, default: true },
    },
    schemaOptions,
  ),
);
