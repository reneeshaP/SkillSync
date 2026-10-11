import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import ConnectionRequest from './models/ConnectionRequest.js';
import Session from './models/Session.js';
import AvailabilitySlot from './models/AvailabilitySlot.js';
import Review from './models/Review.js';
import { updateUserEmbedding } from './services/embedding.service.js';

dotenv.config();

const MENTORS = [
  {
    username: 'mentor1',
    email: 'mentor1@skillsync.dev',
    skills: ['JavaScript', 'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Responsive Design'],
    bio: 'Frontend engineer focused on React and design systems. I help mentees build clean, accessible UIs and get comfortable with modern frontend tooling.',
    experience: '6 years as a frontend engineer at product companies',
  },
  {
    username: 'mentor2',
    email: 'mentor2@skillsync.dev',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Microservices', 'SQL'],
    bio: 'Backend engineer specializing in Node.js services and API design. I mentor on building scalable, well-tested backend systems.',
    experience: '7 years building backend systems, mostly Node.js and Postgres',
  },
  {
    username: 'mentor3',
    email: 'mentor3@skillsync.dev',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git'],
    bio: 'Full-stack MERN developer. I mentor people going from tutorials to shipping real full-stack projects end to end.',
    experience: '5 years full-stack, shipped several MERN products from scratch',
  },
  {
    username: 'mentor4',
    email: 'mentor4@skillsync.dev',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    bio: 'DevOps/cloud engineer. I help mentees get comfortable with containers, CI/CD pipelines, and running real infrastructure on AWS.',
    experience: '8 years in DevOps and cloud infrastructure',
  },
  {
    username: 'mentor5',
    email: 'mentor5@skillsync.dev',
    skills: ['Python', 'Machine Learning', 'Data Science', 'Pandas', 'TensorFlow', 'Data Analysis'],
    bio: 'Data scientist mentoring newcomers into ML and data analysis, from Python fundamentals to shipping real models.',
    experience: '5 years as a data scientist, focus on applied ML',
  },
  {
    username: 'mentor6',
    email: 'mentor6@skillsync.dev',
    skills: ['React Native', 'Flutter', 'iOS Development', 'Android Development'],
    bio: 'Mobile engineer working across React Native and native iOS/Android. I mentor people shipping their first mobile app.',
    experience: '6 years building and shipping mobile apps',
  },
  {
    username: 'mentor7',
    email: 'mentor7@skillsync.dev',
    skills: ['UI/UX Design', 'Figma', 'Product Design', 'Wireframing', 'Communication'],
    bio: 'Product designer mentoring on UI/UX fundamentals, Figma workflows, and turning designs into developer-ready specs.',
    experience: '7 years in product design at startups',
  },
];

const PASSWORD = 'MentorDemo123!';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const Model of [User, Post, Chat, Message, ConnectionRequest, Session, AvailabilitySlot, Review]) {
    const { deletedCount } = await Model.deleteMany({});
    console.log(`Cleared ${Model.modelName}: ${deletedCount} document(s)`);
  }

  console.log('\nSeeding mentors...');
  for (const m of MENTORS) {
    const user = new User({
      username: m.username,
      email: m.email,
      password: PASSWORD,
      role: 'mentor',
      roleConfirmed: true,
      profileCompleted: true,
      bio: m.bio,
      skills: m.skills,
      experience: m.experience,
    });
    await user.save();
    try {
      await updateUserEmbedding(user);
      console.log(`Created ${user.username} (${m.skills.join(', ')}) — embedding OK`);
    } catch (err) {
      console.error(`Created ${user.username} but embedding failed: ${err.message}`);
    }
  }

  console.log(`\nDone. Password for all seeded mentors: ${PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Reset/seed failed:', err);
  process.exit(1);
});
