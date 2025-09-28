const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Define Member schema
const memberSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  role: String,
  organization: String,
  facebook: String,
  experience: String,
  interests: [String],
  otherInterest: String,
  meetingPreference: String,
  heardFrom: String,
  otherSourceText: String,
  agreedToTerms: Boolean,
  paid: { type: Boolean, default: false },
  paidDate: Date,
  paidBy: String,
  emailSent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  password: String,
  temporaryPassword: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  joinedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Member = mongoose.model('Member', memberSchema);

async function setTestPassword() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection successful!');

    // Find the test member
    const testMember = await Member.findOne({ email: 'test@member.com' });
    
    if (!testMember) {
      console.log('Test member not found!');
      return;
    }
    
    console.log(`Found test member: ${testMember.fullName} (${testMember.email})`);
    console.log(`Current status - Paid: ${testMember.paid}, Active: ${testMember.isActive}`);
    
    // Set a known password
    const testPassword = 'testpass123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    // Update the member with the new password
    await Member.findByIdAndUpdate(testMember._id, {
      password: hashedPassword
    });
    
    console.log(`\nPassword set successfully!`);
    console.log(`Email: test@member.com`);
    console.log(`Password: ${testPassword}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
setTestPassword();