const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

// Admin schema (copied from models/Admin.ts)
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node create-admin-simple.js <email> <fullName> <password> [role]');
      console.log('Example: node create-admin-simple.js admin@example.com "John Doe" mypassword123 admin');
      console.log('Roles: admin (default) or super_admin');
      process.exit(1);
    }
    
    const [email, fullName, password, role = 'admin'] = args;
    
    // Validate inputs
    if (!email || !fullName || !password) {
      console.log('❌ Email, full name, and password are required!');
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      process.exit(1);
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Please enter a valid email address!');
      process.exit(1);
    }
    
    // Validate role
    if (role !== 'admin' && role !== 'super_admin') {
      console.log('❌ Role must be either "admin" or "super_admin"!');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/awscc';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      console.log('❌ An admin with this email already exists!');
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Creating admin...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName.trim(),
      role: role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newAdmin.save();

    console.log('\n✅ Admin created successfully!');
    console.log('\nAdmin Details:');
    console.log(`📧 Email: ${newAdmin.email}`);
    console.log(`👤 Name: ${newAdmin.fullName}`);
    console.log(`🔑 Role: ${newAdmin.role}`);
    console.log(`📅 Created: ${newAdmin.createdAt}`);
    
    console.log('\n🎉 You can now login to the admin panel at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    
    if (error.code === 11000) {
      console.error('This email is already registered as an admin.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\nOperation cancelled by user.');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
createAdmin().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});