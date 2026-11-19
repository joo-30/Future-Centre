import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config.js';
import { connectDatabase } from './database/connect.js';
import { seed } from './seed.js';
import { expirePending } from './services/booking/reservations.js';
import path from 'node:path';
import { existsSync } from 'node:fs';

// If URI uses local 27027, ensure database is started before connecting
if (config.MONGODB_URI.includes('127.0.0.1:27027')) {
  try {
    const candidates = [
      path.resolve(process.cwd(), 'scripts/database.mjs'),
      path.resolve(process.cwd(), '../scripts/database.mjs'),
    ];
    const script = candidates.find(existsSync);
    if (script) {
      const { startDatabase } = await import(`file://${script.replace(/\\/g, '/')}`);
      await startDatabase();
    }
  } catch (err) {
    console.warn('Auto-start database notice:', err);
  }
}

await connectDatabase(config.MONGODB_URI);
await seed();
const server = createApp().listen(config.PORT, config.HOST, () =>
  console.log(`Future Center API: http://${config.HOST}:${config.PORT}`),
);

server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;

const cleanup = setInterval(
  () => void expirePending().catch(() => console.error('Pending reservation cleanup failed')),
  60000,
);
cleanup.unref();

async function shutdown() {
  clearInterval(cleanup);
  if (typeof (server as any).closeAllConnections === 'function') {
    (server as any).closeAllConnections();
  }
  server.close(() => {
    console.log('HTTP server closed cleanly.');
  });
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at Promise:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
