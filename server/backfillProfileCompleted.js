import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const result = await User.updateMany(
    { 'skills.0': { $exists: true }, profileCompleted: { $ne: true } },
    { $set: { profileCompleted: true } }
  );

  console.log(`Marked ${result.modifiedCount} already-populated user(s) as profileCompleted.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
