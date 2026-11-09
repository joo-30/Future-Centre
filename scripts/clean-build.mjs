import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const directory of ['client/dist', 'server/dist', 'shared/dist']) {
  const target = path.resolve(projectRoot, directory);
  let resolved;
  try {
    resolved = await fs.realpath(target);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }

  const relative = path.relative(projectRoot, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to clean a build directory outside the project: ${target}`);
  }

  await fs.rm(target, { recursive: true, force: true });
}

console.log('Removed generated build output.');
