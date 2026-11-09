import { passwordSchema, phoneSchema } from '@future/shared';
import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { Writable } from 'node:stream';
import { config } from '../server/src/config.js';
import { connectDatabase } from '../server/src/database/connect';
import { hash } from '../server/src/lib/crypto';
import { Session } from '../server/src/models/session.model';
import { User } from '../server/src/models/user.model';
import { createUser, passwordHash } from '../server/src/services/auth.service';

// Local bootstrap uses random credentials. Existing accounts are never promoted or overwritten.
const args = process.argv.slice(2);
const local = args.includes('--local');
const phone = phoneSchema.parse(
  args.find((v) => v.startsWith('--phone='))?.slice(8) || '01041504201',
);
const name = args.find((v) => v.startsWith('--name='))?.slice(7) || 'إدارة مركز المستقبل';
if (config.NODE_ENV === 'production' && local)
  throw new Error('--local is available for development only.');
await connectDatabase(config.MONGODB_URI);
try {
  if (local) {
    const existingAdmin = await User.findOne({ role: 'admin' }).lean();
    if (existingAdmin) {
      console.log('An administrator already exists. No account or credentials changed.');
    } else {
      const accessFile = path.resolve('.local/admin-access.txt');
      try {
        await fs.access(accessFile);
        throw new Error(
          'An old credential file exists. Preserve or rename it before creating a new local administrator.',
        );
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
      }
      if (await User.exists({ phone }))
        throw new Error(
          'This phone already belongs to another account. Choose an unused administrator phone.',
        );
      const password = crypto.randomBytes(24).toString('base64url');
      const result = await createUser(name, phone, password, 'admin');
      const file = path.resolve('.local/admin-access.txt');
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(
        file,
        `LOCAL DEVELOPMENT ONLY\nLogin: http://127.0.0.1:5176/login\nAdmin: http://127.0.0.1:5176/admin\nPhone: ${phone}\nPassword: ${password}\nRecovery code: ${result.recoveryCode}\nChange the password from /account after first sign-in. Do not upload this file.\n`,
        { flag: 'wx' },
      );
      console.log(
        'Created local administrator. Credentials saved privately to .local/admin-access.txt',
      );
    }
  } else {
    if (!args.includes('--reset'))
      throw new Error(
        'Use --local to bootstrap development, or --reset --phone=... with a new password on stdin for an existing account.',
      );
    let input = '';
    if (process.stdin.isTTY) {
      process.stdout.write('New password (hidden): ');
      const silent = new Writable({
        write(_chunk, _encoding, callback) {
          callback();
        },
      });
      const rl = readline.createInterface({ input: process.stdin, output: silent, terminal: true });
      input = await new Promise<string>((resolve) =>
        rl.question('', (answer) => {
          rl.close();
          process.stdout.write('\n');
          resolve(answer);
        }),
      );
    } else {
      for await (const chunk of process.stdin) input += chunk;
    }
    const password = passwordSchema.parse(input.trim());
    const code = crypto.randomBytes(24).toString('base64url');
    const user = await User.findOneAndUpdate(
      { phone },
      {
        $set: { passwordHash: await passwordHash(password), recoveryHash: hash(code) },
        $inc: { authVersion: 1 },
      },
      { returnDocument: 'after' },
    );
    if (!user) throw new Error('Account not found.');
    await Session.deleteMany({ userId: user._id });
    const file = path.resolve('.local/recovery-' + Date.now() + '.txt');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `Phone: ${phone}\nNew recovery code: ${code}\n`, { flag: 'wx' });
    console.log('Password reset; sessions revoked. New recovery code saved to ' + file);
  }
} finally {
  await mongoose.disconnect();
}
