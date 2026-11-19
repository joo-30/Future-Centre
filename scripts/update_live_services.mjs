import mongoose from 'mongoose';

const uri = 'mongodb://127.0.0.1:27027/future_center?replicaSet=future-center';

async function updateServices() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  const col = db.collection('services');

  // 1. nutrition
  const r1 = await col.updateOne(
    { id: 'nutrition' },
    { $set: { price: 200, duration: 45, sessions: 1 } }
  );
  console.log('nutrition updated:', r1.modifiedCount);

  // 2. monthly
  const r2 = await col.updateOne(
    { id: 'monthly' },
    { $set: { price: 280, duration: 30, sessions: 4 } }
  );
  console.log('monthly updated:', r2.modifiedCount);

  // 3. women
  const r3 = await col.updateOne(
    { id: 'women' },
    { $set: { price: 200, duration: 45, sessions: 1 } }
  );
  console.log('women updated:', r3.modifiedCount);

  const all = await col.find({}).toArray();
  console.log('Current services in DB:');
  for (const s of all) {
    console.log(`- ${s.id}: title="${s.title}", price=${s.price}, duration=${s.duration}, sessions=${s.sessions}`);
  }

  await mongoose.disconnect();
}

updateServices().catch(err => {
  console.error(err);
  process.exit(1);
});
