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

// Member schema (copied from models/Member.ts)
const memberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dob: { type: String, required: true },
    role: { type: String, required: true },
    organization: { type: String },
    linkedin: { type: String },
    experience: { 
      type: String, 
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    certifications: { type: String },
    otherPlatforms: { type: String },
    whyJoin: { type: String, required: true },
    interests: { type: [String], required: true },
    otherInterest: { type: String },
    contribution: { type: String, required: true },
    meetingPreference: { 
      type: String, 
      required: true,
      enum: ['weekday', 'weekend', 'flexible']
    },
    heardFrom: { 
      type: String, 
      required: true,
      enum: ['wordOfMouth', 'socialMedia', 'emailNewsletter', 'website', 'other']
    },
    otherSourceText: { type: String },
    agreement: { type: Boolean, required: true },
    paid: { type: Boolean, default: false },
    password: { type: String },
    temporaryPassword: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    emailSent: { type: Boolean, default: false },
    paidDate: { type: Date },
    paidBy: { type: String },
    submissionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Member = mongoose.model('Member', memberSchema);

async function createTestMember() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');

    // Test member data
    const testMemberData = {
      fullName: 'Test Member',
      email: 'test@member.com',
      phone: '+216 12 345 678',
      dob: '1995-01-15',
      role: 'Student',
      organization: 'Test University',
      linkedin: 'https://linkedin.com/in/testmember',
      experience: 'intermediate',
      certifications: 'AWS Cloud Practitioner',
      otherPlatforms: 'GitHub, Docker',
      whyJoin: 'I want to learn more about AWS and cloud technologies',
      interests: ['cloud-computing', 'devops', 'machine-learning'],
      otherInterest: 'Serverless architecture',
      contribution: 'I can help with documentation and organizing events',
      meetingPreference: 'flexible',
      heardFrom: 'website',
      agreement: true,
      paid: true,
      isActive: true,
      emailSent: true,
      paidDate: new Date(),
      submissionDate: new Date()
    };

    // Hash the password
    const password = 'testpassword123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    testMemberData.password = hashedPassword;

    // Check if member already exists
    const existingMember = await Member.findOne({ email: testMemberData.email });
    if (existingMember) {
      console.log('Test member already exists. Updating password...');
      existingMember.password = hashedPassword;
      await existingMember.save();
      console.log('Test member password updated successfully!');
    } else {
      // Create new test member
      const testMember = new Member(testMemberData);
      await testMember.save();
      console.log('Test member created successfully!');
    }

    console.log('\n=== Test Member Login Credentials ===');
    console.log('Email: test@member.com');
    console.log('Password: testpassword123');
    console.log('\nYou can now use these credentials to test the member dashboard at:');
    console.log('http://localhost:3000/login');
    console.log('\nAfter login, you will be redirected to:');
    console.log('http://localhost:3000/dashboard');
    console.log('\n======================================');

  } catch (error) {
    console.error('Error creating test member:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createTestMember();
}

module.exports = { createTestMember };