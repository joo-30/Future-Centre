import mongoose from 'mongoose';
import { Appointment } from '../../models/appointment.model.js';
import { Reservation } from '../../models/reservation.model.js';
import { cells } from './policy.js';

export async function expirePending() {
  const pending = await Appointment.find({ status: 'pending', holdUntil: { $lte: new Date() } })
    .select('_id')
    .lean();
  for (const p of pending) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const updated = await Appointment.updateOne(
          { _id: p._id, status: 'pending', holdUntil: { $lte: new Date() } },
          {
            $set: { status: 'expired', holdUntil: null, reschedule: null },
            $push: {
              history: {
                status: 'expired',
                at: new Date(),
                message: 'انتهت مهلة مراجعة الطلب. يمكنك طلب وقت جديد.',
                actor: 'system',
              },
            },
          },
          { session },
        );
        if (updated.modifiedCount)
          await Reservation.deleteMany({ appointmentId: p._id }, { session });
      });
    } finally {
      await session.endSession();
    }
  }
}

export async function reserve(
  id: mongoose.Types.ObjectId,
  date: string,
  start: number,
  end: number,
  session: mongoose.ClientSession,
) {
  await Reservation.insertMany(
    cells(start, end).map((minute) => ({ appointmentId: id, provider: 'main', date, minute })),
    { session, ordered: true },
  );
}
