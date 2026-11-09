import mongoose from 'mongoose';
import { Audit } from '../models/audit.model.js';

export const audit = async (
  actorId: mongoose.Types.ObjectId | undefined,
  action: string,
  target: string,
) => Audit.create({ actorId, action, target });
