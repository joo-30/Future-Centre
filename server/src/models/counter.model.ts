import mongoose, { Schema } from 'mongoose';

export interface CounterRecord {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterRecord>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter = mongoose.model<CounterRecord>('Counter', counterSchema);

/**
 * Returns the next sequential patient file number (e.g. 1, 2, 3...) atomically.
 */
export async function getNextFileNumber(): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    'patient_file_number',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );
  return counter.seq;
}
