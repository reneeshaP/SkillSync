import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const chats = await Chat.find();
  const groups = new Map();

  for (const chat of chats) {
    const key = chat.members.map(id => id.toString()).sort().join('_');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(chat);
  }

  let mergedGroups = 0;
  let movedMessages = 0;

  for (const [key, groupChats] of groups) {
    if (groupChats.length <= 1) continue;

    // Keep the oldest chat as the primary; merge the rest into it
    groupChats.sort((a, b) => a.createdAt - b.createdAt);
    const [primary, ...duplicates] = groupChats;

    for (const dup of duplicates) {
      const result = await Message.updateMany(
        { chatId: dup._id },
        { $set: { chatId: primary._id } }
      );
      movedMessages += result.modifiedCount;
      await Chat.deleteOne({ _id: dup._id });
      console.log(`Merged chat ${dup._id} into ${primary._id} (moved ${result.modifiedCount} message(s)), group: ${key}`);
    }

    // Point lastMessage at whichever message is now the most recent in the primary chat
    const latest = await Message.findOne({ chatId: primary._id }).sort({ createdAt: -1 });
    if (latest) {
      primary.lastMessage = latest._id;
      await primary.save();
    }

    mergedGroups++;
  }

  console.log(`\nDone. Merged ${mergedGroups} duplicate group(s), moved ${movedMessages} message(s).`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Merge failed:', err);
  process.exit(1);
});
