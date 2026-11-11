import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

async function syncCategoriesAndGallery() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27027/future_center?replicaSet=rs0';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('stories');

  // Copy Safia with doctor photo
  const safiaDoctorSrc = 'C:/Users/asus1/.gemini/antigravity/brain/737eb81e-624f-4504-b938-d04ece747f9b/.user_uploaded/media_1794314883918_d024ff79.jpg';
  const dstPub = path.resolve('client/public/stories/safia_with_dr.jpg');
  const dstDist = path.resolve('client/dist/stories/safia_with_dr.jpg');
  if (fs.existsSync(safiaDoctorSrc)) {
    fs.copyFileSync(safiaDoctorSrc, dstPub);
    if (fs.existsSync(path.dirname(dstDist))) {
      fs.copyFileSync(safiaDoctorSrc, dstDist);
    }
    console.log('Copied safia_with_dr.jpg');
  }

  // Update categories
  await col.updateOne({ name: { $regex: 'ندى' } }, { $set: { category: 'إنقاص وزن' } });
  await col.updateOne({ name: { $regex: 'سامح' } }, { $set: { category: 'مقاومة الأنسولين' } });
  await col.updateOne(
    { name: { $regex: 'صفية' } },
    {
      $set: {
        category: 'إنقاص وزن',
        additionalImages: ['/stories/safia_with_dr.jpg']
      }
    }
  );
  await col.updateOne({ name: { $regex: 'نهى' } }, { $set: { category: 'إنقاص وزن' } });
  await col.updateOne({ name: { $regex: 'إيمان' } }, { $set: { category: 'تغذية' } });
  await col.updateOne({ name: { $regex: 'سيدات ومراجعات' } }, { $set: { category: 'صحة المرأة' } });

  const count = await col.countDocuments();
  console.log(`Updated stories categories and gallery in MongoDB (${count} total)`);
  await mongoose.disconnect();
}

syncCategoriesAndGallery().catch(console.error);
