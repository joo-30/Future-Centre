import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27027/future_center?replicaSet=future-center');
  const db = mongoose.connection.getClient().db('future_center');
  const collection = db.collection('stories');

  await collection.updateOne(
    { name: { $regex: 'صفية' } },
    { $set: { imageUrl: '/stories/transformation_safia.jpg', detailsImageUrl: '/stories/safia_with_dr.jpg' } }
  );
  await collection.updateOne(
    { name: { $regex: 'سامح' } },
    { $set: { imageUrl: '/stories/transformation_sameh.jpg', detailsImageUrl: '/stories/transformation_sameh.jpg' } }
  );
  await collection.updateOne(
    { name: { $regex: 'ندى' } },
    { $set: { imageUrl: '/stories/transformation_107kg.jpg', detailsImageUrl: '/stories/transformation_107kg.jpg' } }
  );

  console.log('Successfully updated all 3 client cases with matching square before/after transformation photos!');
  await mongoose.disconnect();
}

main().catch(console.error);
