import type { UserRecord } from '../models/user.model.js';
declare global {
  namespace Express {
    interface Request {
      authUser?: UserRecord;
      authAdmin?: UserRecord;
      authPatient?: UserRecord;
      sessionHash?: string;
    }
  }
}
export {};
