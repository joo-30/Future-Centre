import type { DayHours } from '@future/shared';
import mongoose, { Schema } from 'mongoose';
import { schemaOptions } from './options.js';

export interface ClinicRecord {
  key: string;
  name: string;
  subtitle: string;
  phones: string[];
  whatsapp: string;
  address: string;
  city: string;
  timezone: string;
  demoSchedule: boolean;
  demoPrices: boolean;
  hours: DayHours[];
  blocks: { date: string; start: string; end: string; reason: string }[];
  dailyLimit?: {
    enabled: boolean;
    showToPatients?: boolean;
    maxPatients: number;
    weekdayLimits?: Record<string, number>;
    dateOverrides?: Record<string, number>;
    closedMessage?: string;
  };
  revision: number;
}

const hoursSchema = new Schema<DayHours>(
  {
    weekday: { type: Number, required: true },
    open: { type: Boolean, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    breaks: [new Schema({ start: String, end: String }, { _id: false })],
  },
  { _id: false },
);

const blockSchema = new Schema<ClinicRecord['blocks'][number]>(
  { date: String, start: String, end: String, reason: String },
  { _id: false },
);

export const Clinic = mongoose.model<ClinicRecord>(
  'Clinic',
  new Schema<ClinicRecord>(
    {
      key: { type: String, unique: true, required: true },
      name: String,
      subtitle: String,
      phones: [String],
      whatsapp: String,
      address: String,
      city: String,
      timezone: String,
      demoSchedule: Boolean,
      demoPrices: Boolean,
      hours: { type: [hoursSchema], required: true },
      blocks: { type: [blockSchema], default: [] },
      dailyLimit: {
        enabled: { type: Boolean, default: true },
        showToPatients: { type: Boolean, default: true },
        maxPatients: { type: Number, default: 12 },
        weekdayLimits: { type: Map, of: Number, default: {} },
        dateOverrides: { type: Map, of: Number, default: {} },
        closedMessage: {
          type: String,
          default:
            'عفواً، اكتمل الحد الأقصى للحجوزات لهذا اليوم لضمان أعلى جودة رعاية لكل مريض. يُرجى اختيار موعد في يوم آخر.',
        },
      },
      revision: { type: Number, default: 0 },
    },
    schemaOptions,
  ),
);
