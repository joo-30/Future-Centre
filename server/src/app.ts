import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { requireAdministrativeAccess } from './middleware/admin-access.js';
import { handleApiError } from './middleware/error-handler.js';
import { loadSession, protectOrigin } from './middleware/session.js';
import { accountRouter } from './routes/account.routes.js';
import { adminRouter } from './routes/admin/index.js';
import { authRouter } from './routes/auth.routes.js';
import { router as appointmentsRouter } from './routes/public/appointments.routes.js';
import { router as catalogRouter } from './routes/public/catalog.routes.js';
import { router as interestsRouter } from './routes/public/interests.routes.js';
import { router as storiesRouter } from './routes/public/stories.routes.js';
export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({ referrerPolicy: { policy: 'no-referrer' } }));

  const isDev = config.NODE_ENV !== 'production';
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || isDev || origin === config.CLIENT_ORIGIN || origin === config.PUBLIC_ORIGIN) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '20kb' }));
  app.use('/api', loadSession, protectOrigin);

  if (config.NODE_ENV !== 'test')
    app.use(
      '/api',
      rateLimit({
        windowMs: 15 * 60000,
        limit: config.NODE_ENV === 'development' ? 10000 : 1500,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        validate: { trustProxy: false },
        skip: (req) => Boolean(req.authAdmin || req.authUser?.role === 'admin'),
        message: {
          error: { code: 'RATE_LIMIT', message: 'طلبات كثيرة خلال وقت قصير. حاولي بعد قليل.' },
        },
      }),
    );
  app.use('/api/auth', authRouter);
  app.use('/api/account', accountRouter);
  app.use('/api', catalogRouter, appointmentsRouter, interestsRouter, storiesRouter);
  app.use('/api/admin', requireAdministrativeAccess, adminRouter);
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'المسار المطلوب غير موجود.' } }),
  );
  if (config.NODE_ENV === 'production') {
    const clientDist = path.resolve('client/dist');
    if (existsSync(clientDist)) {
      app.use(express.static(clientDist));
      app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
    }
  }
  app.use(handleApiError);
  return app;
}
