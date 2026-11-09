import crypto from 'node:crypto';
import { config } from '../config.js';
import { type AppointmentRecord } from '../models/appointment.model.js';

export const tokenFor = (id: string, keyHash: string) =>
  crypto
    .createHmac('sha256', config.TRACKING_SECRET)
    .update(`${id}:${keyHash}`)
    .digest('base64url');

export const privateTokenFor = (appointment: AppointmentRecord) =>
  tokenFor(appointment._id.toString(), appointment.idempotencyHash);
