import { dateSchema, timeSchema } from '@future/shared';
import { z } from 'zod';

const daily = z
  .object({
    weekday: z.number().int().min(1).max(7),
    open: z.boolean(),
    start: timeSchema,
    end: timeSchema,
    breaks: z.array(z.object({ start: timeSchema, end: timeSchema }).strict()).max(8),
  })
  .strict();

export const scheduleSchema = z
  .object({
    hours: z.array(daily).length(7),
    blocks: z
      .array(
        z
          .object({
            date: dateSchema,
            start: timeSchema,
            end: timeSchema,
            reason: z.string().max(100).default('غير متاح'),
          })
          .strict(),
      )
      .max(500),
    demoSchedule: z.boolean().optional(),
  })
  .strict();
