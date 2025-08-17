import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Admin = (await import('../models/Admin.js')).default;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban';
console.log('Connecting to MongoDB...');
await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

console.log('Creating admin users...');

try {
  // Create Super Admin
  const superAdminPassword = 'superadmin123';
  const superAdminHash = await bcrypt.hash(superAdminPassword, 10);
  
  let superAdmin = await Admin.findOne({ email: 'superadmin@urbanifs.com' });
  if (superAdmin) {
    superAdmin.password = superAdminHash;
    superAdmin.role = 'SUPER_ADMIN';
    superAdmin.permissions = ['manage_users', 'manage_issues', 'manage_workorders', 'view_reports', 'system_settings'];
    await superAdmin.save();
    console.log('Updated Super Admin');
  } else {
    superAdmin = await Admin.create({
      name: 'Super Administrator',
      email: 'superadmin@urbanifs.com',
      password: superAdminHash,
      role: 'SUPER_ADMIN',
      permissions: ['manage_users', 'manage_issues', 'manage_workorders', 'view_reports', 'system_settings']
    });
    console.log('Created Super Admin');
  }

  // Create Regular Admin
  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  
  let admin = await Admin.findOne({ email: 'admin@urbanifs.com' });
  if (admin) {
    admin.password = adminHash;
    admin.role = 'ADMIN';
    admin.permissions = ['manage_issues', 'manage_workorders', 'view_reports'];
    await admin.save();
    console.log('Updated Admin');
  } else {
    admin = await Admin.create({
      name: 'System Administrator',
      email: 'admin@urbanifs.com',
      password: adminHash,
      role: 'ADMIN',
      permissions: ['manage_issues', 'manage_workorders', 'view_reports']
    });
    console.log('Created Admin');
  }

  // Create Moderator
  const moderatorPassword = 'moderator123';
  const moderatorHash = await bcrypt.hash(moderatorPassword, 10);
  
  let moderator = await Admin.findOne({ email: 'moderator@urbanifs.com' });
  if (moderator) {
    moderator.password = moderatorHash;
    moderator.role = 'MODERATOR';
    moderator.permissions = ['manage_issues', 'view_reports'];
    await moderator.save();
    console.log('Updated Moderator');
  } else {
    moderator = await Admin.create({
      name: 'System Moderator',
      email: 'moderator@urbanifs.com',
      password: moderatorHash,
      role: 'MODERATOR',
      permissions: ['manage_issues', 'view_reports']
    });
    console.log('Created Moderator');
  }
  
  console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
  console.log('\nSuper Admin:');
  console.log('Email: superadmin@urbanifs.com');
  console.log('Password: superadmin123');
  console.log('Role: SUPER_ADMIN (Full access)');
  
  console.log('\nAdmin:');
  console.log('Email: admin@urbanifs.com');
  console.log('Password: admin123');
  console.log('Role: ADMIN (Issue & Work Order management)');
  
  console.log('\nModerator:');
  console.log('Email: moderator@urbanifs.com');
  console.log('Password: moderator123');
  console.log('Role: MODERATOR (Issue management only)');
  console.log('==========================================\n');
  
} catch (error) {
  console.error('Error creating admin users:', error.message);
}

await mongoose.disconnect();
console.log('Admin seed complete');
