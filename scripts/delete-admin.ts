import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'node:readline';
import fs from 'node:fs/promises';
import path from 'node:path';
import { phoneSchema } from '@future/shared';
import { config } from '../server/src/config.js';
import { connectDatabase } from '../server/src/database/connect.js';
import { Session } from '../server/src/models/session.model.js';
import { User } from '../server/src/models/user.model.js';

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

async function cleanLocalCredentialsFile() {
  try {
    const accessFile = path.resolve('.local/admin-access.txt');
    await fs.unlink(accessFile);
  } catch {
    // Ignore if not found
  }
}

async function deleteAdminUser(user: InstanceType<typeof User>) {
  const id = user._id;
  const name = user.name;
  const phone = user.phone;

  // Delete user record
  await User.deleteOne({ _id: id });

  // Delete all active sessions
  const sessionsResult = await Session.deleteMany({ userId: id });

  // Remove local credential file if exists
  await cleanLocalCredentialsFile();

  console.log('\n=============================================');
  console.log('🗑️  تم حذف حساب الأدمن بنجاح!');
  console.log(`👤 الاسم: ${name}`);
  console.log(`📱 الهاتف: ${phone}`);
  console.log(`🔒 تم إنهاء الجلسات النشطة: ${sessionsResult.deletedCount}`);
  console.log('=============================================\n');
}

async function main() {
  await connectDatabase(config.MONGODB_URI);

  try {
    const args = process.argv.slice(2);
    const targetArg = args[0]?.trim();

    const admins = await User.find({ role: 'admin' });

    if (admins.length === 0) {
      console.log('\nℹ️  لا يوجد أي حساب أدمن (Admin) مسجل في قاعدة البيانات حالياً.\n');
      return;
    }

    if (targetArg) {
      // Check if delete all
      if (targetArg.toLowerCase() === 'all' || targetArg === 'الكل') {
        const adminIds = admins.map((a) => a._id);
        const delResult = await User.deleteMany({ _id: { $in: adminIds } });
        const sessResult = await Session.deleteMany({ userId: { $in: adminIds } });
        await cleanLocalCredentialsFile();

        console.log('\n=============================================');
        console.log(`🗑️  تم حذف جميع حسابات الأدمن بنجاح (${delResult.deletedCount} حساب)!`);
        console.log(`🔒 تم إنهاء الجلسات النشطة: ${sessResult.deletedCount}`);
        console.log('=============================================\n');
        return;
      }

      // Check by phone
      let parsedPhone: string;
      try {
        parsedPhone = phoneSchema.parse(targetArg);
      } catch {
        parsedPhone = targetArg;
      }

      const match = admins.find(
        (a) => a.phone === parsedPhone || a.phone.replace('+20', '0') === targetArg.replace('+20', '0')
      );

      if (!match) {
        console.error(`❌ لم يتم العثور على حساب أدمن برقم الهاتف: ${targetArg}`);
        console.log('الأدمنز المسجلون حالياً:');
        admins.forEach((a, i) => {
          console.log(`  [${i + 1}] ${a.name} (${a.phone})`);
        });
        return;
      }

      await deleteAdminUser(match);
      return;
    }

    // Interactive mode
    console.log('\n📋 قائمة مسؤولي النظام (Admins) المسجلين حالياً:');
    admins.forEach((admin, idx) => {
      console.log(`  [${idx + 1}] الاسم: ${admin.name} | رقم الهاتف: ${admin.phone}`);
    });
    console.log('');

    const answer = await prompt(
      'اختر رقم الأدمن لحذفه (أو اكتب "all" لحذف الجميع، أو اضغط Enter للإلغاء): '
    );

    if (!answer) {
      console.log('↩️ تم إلغاء العملية.');
      return;
    }

    if (answer.toLowerCase() === 'all' || answer === 'الكل') {
      const confirm = await prompt('⚠️ هل أنت متأكد من رغبتك في حذف جميع حسابات الأدمن؟ (اكتب y أو نعم للتأكيد): ');
      if (confirm.toLowerCase() === 'y' || confirm === 'نعم') {
        const adminIds = admins.map((a) => a._id);
        const delResult = await User.deleteMany({ _id: { $in: adminIds } });
        const sessResult = await Session.deleteMany({ userId: { $in: adminIds } });
        await cleanLocalCredentialsFile();

        console.log('\n=============================================');
        console.log(`🗑️  تم حذف جميع حسابات الأدمن بنجاح (${delResult.deletedCount} حساب)!`);
        console.log('=============================================\n');
      } else {
        console.log('↩️ تم إلغاء العملية.');
      }
      return;
    }

    const choiceNum = parseInt(answer, 10);
    if (!isNaN(choiceNum) && choiceNum >= 1 && choiceNum <= admins.length) {
      const chosenAdmin = admins[choiceNum - 1];
      await deleteAdminUser(chosenAdmin);
      return;
    }

    // Try matching by entered phone number
    let parsedPhone: string;
    try {
      parsedPhone = phoneSchema.parse(answer);
    } catch {
      parsedPhone = answer;
    }

    const matchByPhone = admins.find(
      (a) => a.phone === parsedPhone || a.phone.replace('+20', '0') === answer.replace('+20', '0')
    );

    if (matchByPhone) {
      await deleteAdminUser(matchByPhone);
    } else {
      console.log('❌ اختيار غير صالح. تم إلغاء العملية.');
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('❌ حدث خطأ:', err);
  process.exit(1);
});
