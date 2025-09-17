const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to hide password input
function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    const onData = function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', onData);
          process.stdin.pause();
          process.stdout.write('\n');
          // Reset stdin for normal input
          setTimeout(() => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
          }, 100);
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/awscc';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log('\n⚠️  An admin already exists in the database:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.fullName}`);
      console.log(`Role: ${existingAdmin.role}`);
      
      const proceed = await askQuestion('\nDo you want to create another admin? (y/N): ');
      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }

    console.log('\n=== Create New Admin ===\n');

    // Get admin details
    const email = await askQuestion('Enter admin email: ');
    const fullName = await askQuestion('Enter admin full name: ');
    const password = await askPassword('Enter admin password: ');
    const confirmPassword = await askPassword('Confirm password: ');
    
    // Validate inputs
    if (!email || !fullName || !password) {
      console.log('\n❌ All fields are required!');
      process.exit(1);
    }
    
    if (password !== confirmPassword) {
      console.log('\n❌ Passwords do not match!');
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long!');
      process.exit(1);
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('\n❌ Please enter a valid email address!');
      process.exit(1);
    }

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      console.log('\n❌ An admin with this email already exists!');
      process.exit(1);
    }

    // Ask for role
    console.log('\nSelect admin role:');
    console.log('1. Admin (regular admin)');
    console.log('2. Super Admin (can delete members)');
    const roleChoice = await askQuestion('Enter choice (1 or 2): ');
    
    let role = 'admin';
    if (roleChoice === '2') {
      role = 'super_admin';
    } else if (roleChoice !== '1') {
      console.log('\n❌ Invalid choice! Defaulting to regular admin.');
    }

    // Hash password
    console.log('\nCreating admin...');
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
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Name: ${newAdmin.fullName}`);
    console.log(`Role: ${newAdmin.role}`);
    console.log(`Created: ${newAdmin.createdAt}`);
    
    console.log('\n🎉 You can now login to the admin panel at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    
    if (error.code === 11000) {
      console.error('This email is already registered as an admin.');
    }
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\nOperation cancelled by user.');
  rl.close();
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
createAdmin().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});