import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const users = await c.db().collection('users').find({}).limit(10).toArray();
  console.log(users.map(u => ({ id: u._id, name: u.name, phone: u.phone, role: u.role, fileNumber: u.fileNumber })));
  await c.close();
}
run();
