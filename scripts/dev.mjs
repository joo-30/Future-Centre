import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startDatabase } from './database.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
if (!existsSync(envPath)) {
  let text = await fs.readFile(path.join(root, '.env.example'), 'utf8');
  text = text
    .replace(
      'replace-with-a-random-value-of-at-least-32-characters',
      crypto.randomBytes(32).toString('hex'),
    )
    .replace(
      'replace-with-a-different-random-value-of-at-least-32-characters',
      crypto.randomBytes(32).toString('hex'),
    );
  await fs.writeFile(envPath, text, { flag: 'wx' });
  console.log('Created local .env with independent secrets (values hidden).');
}
dotenv.config({ path: envPath, quiet: true });
if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1:27027'))
  await startDatabase();
const stdio = [process.stdin.isTTY ? 'inherit' : 'ignore', 'inherit', 'inherit'];
const serverOnly = process.argv.includes('--server') || process.env.SERVER_ONLY === 'true';
const clientOnly = process.argv.includes('--client') || process.env.CLIENT_ONLY === 'true';

const children = [];
if (!clientOnly) {
  children.push(
    spawn(
      process.execPath,
      [path.join(root, 'node_modules/tsx/dist/cli.mjs'), 'watch', 'server/src/index.ts'],
      { cwd: root, stdio, windowsHide: true },
    ),
  );
}
if (!serverOnly) {
  children.push(
    spawn(
      process.execPath,
      [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1'],
      { cwd: path.join(root, 'client'), stdio, windowsHide: true },
    ),
  );
}
for (const child of children)
  child.on('exit', (code) => {
    if (code) {
      for (const other of children) other.kill();
      process.exitCode = code;
    }
  });
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    for (const child of children) child.kill();
    process.exit(0);
  });
