// Seed users & a sample issue for Urban IFS
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const User = (await import('../models/User.js')).default;
const IssueModule = (await import('../models/Issue.js'));
const Issue = IssueModule.Issue;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban';
console.log('Connecting to MongoDB...');
await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

console.log('Creating new admin user...');

try {
  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  
  // Delete existing admin users to avoid conflicts
  await User.deleteMany({ email: { $in: ['admin@test.com'] } });
  console.log('Cleaned up existing admin users');
  
  // Create new admin user
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@system.com',
    password: adminHash,
    role: 'ADMIN'
  });
  console.log('Created new admin user');
  
  console.log('\n=== NEW ADMIN LOGIN CREDENTIALS ===');
  console.log('Email: admin@system.com');
  console.log('Password: admin123');
  console.log('===================================\n');
  
} catch (error) {
  console.error('Error creating admin:', error.message);
}

console.log('Creating sample issues...');
try {
  const issueCount = await Issue.countDocuments();
  if (issueCount === 0) {
    const admin = await User.findOne({ role: 'ADMIN' });
    
    await Issue.create({
      title: 'Pothole near bus stop',
      description: 'Large pothole causing traffic to swerve.',
      type: 'POTHOLE',
      priority: 'HIGH',
      reporter: admin._id,
      location: { 
        geo: { 
          type: 'Point', 
          coordinates: [153.026, -27.4698] 
        }, 
        address: '123 Queen St' 
      },
      photos: []
    });
    console.log('✓ Created sample pothole issue');
    
    await Issue.create({
      title: 'Broken street light',
      description: 'Street light not working, making the area unsafe at night.',
      type: 'STREET_LIGHT',
      priority: 'MEDIUM',
      reporter: admin._id,
      location: { 
        geo: { 
          type: 'Point', 
          coordinates: [153.027, -27.4700] 
        }, 
        address: '456 Queen St' 
      },
      photos: []
    });
    console.log('✓ Created sample street light issue');
  } else {
    console.log(`Found ${issueCount} existing issues`);
  }
} catch (error) {
  console.error('Error creating issues:', error.message);
}

await mongoose.disconnect();
console.log('Seed complete');