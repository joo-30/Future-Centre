import { Router } from 'express';
import { router as appointments } from './appointments.routes.js';
import { router as capacity } from './capacity.routes.js';
import { router as catalog } from './catalog.routes.js';
import { router as patients } from './patients.routes.js';
import { router as schedule } from './schedule.routes.js';
import { router as settings } from './settings.routes.js';
export const adminRouter = Router();
adminRouter.use(appointments, capacity, schedule, patients, catalog, settings);
