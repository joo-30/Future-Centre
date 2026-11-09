import { MongoClient } from 'mongodb';
import { spawn } from 'node:child_process';
import { closeSync, existsSync, openSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function startDatabase() {
  const uri = 'mongodb://127.0.0.1:27027/?directConnection=true';
  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 700 });
    await client.connect();
  } catch {
    await client?.close();
    const candidates = [
      process.env.MONGOD_PATH,
      'C:/Program Files/MongoDB/Server/8.3/bin/mongod.exe',
      'C:/Program Files/MongoDB/Server/8.2/bin/mongod.exe',
      'C:/Program Files/MongoDB/Server/8.0/bin/mongod.exe',
      'C:/Program Files/MongoDB/Server/7.0/bin/mongod.exe',
    ].filter(Boolean);
    const mongoBase = 'C:/Program Files/MongoDB/Server';
    if (existsSync(mongoBase)) {
      try {
        const dirs = (await fs.readdir(mongoBase)).sort().reverse();
        for (const dir of dirs) {
          candidates.push(path.join(mongoBase, dir, 'bin', 'mongod.exe'));
        }
      } catch {}
    }
    const executable = candidates.find(existsSync);
    if (!executable)
      throw new Error('MongoDB not found. Set MONGOD_PATH or use a replica-set MONGODB_URI.');
    const dbPath = path.join(root, '.local', 'mongo');
    await fs.mkdir(dbPath, { recursive: true });
    const log = openSync(path.join(root, '.local', 'mongo-process.log'), 'a');
    const child = spawn(
      executable,
      [
        '--dbpath',
        dbPath,
        '--port',
        '27027',
        '--bind_ip',
        '127.0.0.1',
        '--replSet',
        'future-center',
      ],
      { cwd: root, windowsHide: true, detached: true, stdio: ['ignore', log, log] },
    );
    child.unref();
    closeSync(log);
    await fs.writeFile(path.join(root, '.local', 'mongo.pid'), String(child.pid));
    for (let i = 0; i < 50; i++) {
      await new Promise((r) => setTimeout(r, 300));
      try {
        client = new MongoClient(uri, { serverSelectionTimeoutMS: 300 });
        await client.connect();
        break;
      } catch {
        await client?.close();
        client = undefined;
      }
    }
    if (!client) throw new Error('Project MongoDB did not start. Inspect .local/mongo-process.log');
  }
  try {
    try {
      const status = await client.db('admin').command({ replSetGetStatus: 1 });
      if (status.set !== 'future-center')
        throw new Error(
          'Port 27027 belongs to another replica set. Configure MONGODB_URI explicitly.',
        );
    } catch (e) {
      if (e.code !== 94) throw e;
      await client.db('admin').command({
        replSetInitiate: { _id: 'future-center', members: [{ _id: 0, host: '127.0.0.1:27027' }] },
      });
    }
    for (let i = 0; i < 60; i++) {
      const hello = await client.db('admin').command({ hello: 1 });
      if (hello.isWritablePrimary) {
        console.log('Project MongoDB ready on 127.0.0.1:27027 (replica set).');
        return;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error('MongoDB primary election timed out.');
  } finally {
    await client.close();
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await startDatabase();
