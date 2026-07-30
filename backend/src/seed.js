require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aiinterview';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@aiinterview.com' });

    if (!adminExists) {
      const admin = new User({
        name: 'Admin',
        email: 'admin@aiinterview.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created: admin@aiinterview.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
