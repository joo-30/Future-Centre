import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'node:readline';
import { phoneSchema, passwordSchema } from '@future/shared';
import { config } from '../server/src/config.js';
import { connectDatabase } from '../server/src/database/connect.js';
import { hash } from '../server/src/lib/crypto.js';
import { Session } from '../server/src/models/session.model.js';
import { User } from '../server/src/models/user.model.js';
import { passwordHash, recoveryCode } from '../server/src/services/auth.service.js';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let rawPhone = args[0];
  let rawPassword = args[1];
  let rawName = args[2];

  if (!rawPhone) {
    rawPhone = await prompt('أدخل رقم هاتف الأدمن (مثال: 01018943002): ');
  }
  if (!rawPassword) {
    rawPassword = await prompt('أدخل كلمة المرور (8 خانات على الأقل تشمل حروف وأرقام): ');
  }
  if (!rawName) {
    const inputName = await prompt('أدخل اسم الأدمن أو الطبيبة (مثال: د. رنا ياسر الشوري - أو اضغط Enter للافتراضي): ');
    rawName = inputName.trim() || 'إدارة مركز المستقبل';
  }

  // Validate phone & password
  let phone: string;
  try {
    phone = phoneSchema.parse(rawPhone);
  } catch (err) {
    console.error('❌ رقم الهاتف غير صالح. يرجى إدخال رقم موبايل مصري صحيح (11 رقم).');
    process.exit(1);
  }

  let password: string;
  try {
    password = passwordSchema.parse(rawPassword);
  } catch (err) {
    console.error('❌ كلمة المرور ضعيفة. يجب أن تتكون من 8 أحرف على الأقل وتجمع بين الحروف والأرقام.');
    process.exit(1);
  }

  await connectDatabase(config.MONGODB_URI);

  try {
    const pwHash = await passwordHash(password);
    const recCode = recoveryCode();
    const recHash = hash(recCode);

    const existing = await User.findOne({ phone });
    if (existing) {
      existing.name = rawName;
      existing.role = 'admin';
      existing.passwordHash = pwHash;
      existing.recoveryHash = recHash;
      existing.authVersion = (existing.authVersion || 0) + 1;
      await existing.save();

      // Revoke any old active sessions
      await Session.deleteMany({ userId: existing._id });
      console.log('\n=============================================');
      console.log('✅ تم بنجاح ترقية الحساب وتحديث كلمة المرور كـ Admin!');
      console.log(`👤 الاسم: ${existing.name}`);
      console.log(`📱 رقم الهاتف: ${phone}`);
      console.log(`🔑 الرتبة: admin (إدارة كاملة)`);
      console.log(`🛡️ كود الاستعادة: ${recCode}`);
      console.log('=============================================\n');
    } else {
      const newUser = await User.create({
        name: rawName,
        phone,
        role: 'admin',
        passwordHash: pwHash,
        recoveryHash: recHash,
        authVersion: 1,
      });

      console.log('\n=============================================');
      console.log('✅ تم إنشاء حساب الأدمن الجديد بنجاح!');
      console.log(`👤 الاسم: ${newUser.name}`);
      console.log(`📱 رقم الهاتف: ${phone}`);
      console.log(`🔑 الرتبة: admin (إدارة كاملة)`);
      console.log(`🛡️ كود الاستعادة: ${recCode}`);
      console.log('=============================================\n');
    }

    console.log('جاهز لتسجيل الدخول الآن من المتصفح: http://localhost:5176/login');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('❌ خطأ:', err);
  process.exit(1);
});
