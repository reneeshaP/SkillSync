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

  let deletedCount = 0;

  for (const [key, groupChats] of groups) {
    if (groupChats.length <= 1) continue;

    const withCounts = await Promise.all(
      groupChats.map(async (chat) => ({
        chat,
        messageCount: await Message.countDocuments({ chatId: chat._id })
      }))
    );

    const withMessages = withCounts.filter(c => c.messageCount > 0);
    const empty = withCounts.filter(c => c.messageCount === 0);

    let toDelete;
    if (withMessages.length > 0) {
      // Keep all chats that have real messages, delete every empty duplicate
      toDelete = empty;
    } else {
      // All duplicates are empty — keep the oldest one, delete the rest
      empty.sort((a, b) => a.chat.createdAt - b.chat.createdAt);
      toDelete = empty.slice(1);
    }

    for (const { chat } of toDelete) {
      await Chat.deleteOne({ _id: chat._id });
      deletedCount++;
      console.log(`Deleted empty duplicate chat ${chat._id} (group: ${key})`);
    }
  }

  console.log(`\nDone. Deleted ${deletedCount} empty duplicate chat(s).`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
