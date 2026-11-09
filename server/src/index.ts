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
const cleanup = setInterval(
  () => void expirePending().catch(() => console.error('Pending reservation cleanup failed')),
  60000,
);
cleanup.unref();
async function shutdown() {
  clearInterval(cleanup);
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
