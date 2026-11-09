import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { pathToFileURL } from 'node:url';
export async function cleanBrowserFixtures() {
  const client = await new MongoClient(process.env.MONGODB_URI).connect();
  try {
    const db = client.db();
    if (db.databaseName !== 'future_center')
      throw new Error('Browser fixture cleanup is restricted to the local preview database.');
    const users = await db
      .collection('users')
      .find(
        { name: 'عميلة اختبار المرحلة الرابعة', phone: '+201000000081' },
        { projection: { _id: 1 } },
      )
      .toArray();
    const ids = users.map((u) => u._id);
    const bookings = await db
      .collection('appointments')
      .find(
        {
          $or: [
            { name: 'عميلة اختبار المرحلة الرابعة', phone: '+201000000081' },
            { name: 'حجز اختبار المتصفح', phone: '+201000000003' },
          ],
        },
        { projection: { _id: 1, reference: 1 } },
      )
      .toArray();
    const bookingIds = bookings.map((b) => b._id);
    await db.collection('reservations').deleteMany({ appointmentId: { $in: bookingIds } });
    await db.collection('appointments').deleteMany({ _id: { $in: bookingIds } });
    await db.collection('sessions').deleteMany({ userId: { $in: ids } });
    const subscriptions = await db
      .collection('subscriptions')
      .find(
        { name: 'عميلة اختبار المرحلة الرابعة', phone: '+201000000081' },
        { projection: { _id: 1 } },
      )
      .toArray();
    await db
      .collection('subscriptions')
      .deleteMany({ _id: { $in: subscriptions.map((s) => s._id) } });
    await db.collection('users').deleteMany({ _id: { $in: ids } });
    await db
      .collection('interests')
      .deleteMany({ name: 'عميلة اختبار للمتصفح', phone: '+201000000002' });
    const services = await db
      .collection('services')
      .find({ id: /^e2e-program-/, title: 'برنامج اختبار الإدارة' }, { projection: { id: 1 } })
      .toArray();
    const articles = await db
      .collection('articles')
      .find({ slug: /^e2e-program-/, title: 'مقال اختبار الإدارة' }, { projection: { slug: 1 } })
      .toArray();
    await db.collection('services').deleteMany({ id: { $in: services.map((s) => s.id) } });
    await db.collection('articles').deleteMany({ slug: { $in: articles.map((a) => a.slug) } });
    const targets = [
      ...bookings.map((b) => b.reference),
      ...subscriptions.map((s) => String(s._id)),
      ...services.map((s) => s.id),
      ...articles.map((a) => a.slug),
    ];
    await db.collection('audits').deleteMany({ target: { $in: targets } });
    return {
      bookings: bookings.length,
      users: ids.length,
      programs: services.length,
      articles: articles.length,
    };
  } finally {
    await client.close();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  console.log(await cleanBrowserFixtures());
