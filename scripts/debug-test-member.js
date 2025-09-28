const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Member schema directly (matching the actual database schema)
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

async function debugTestMember() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection successful!');

    // Find the test member exactly as the login route does
    const email = 'test@member.com';
    console.log(`\nSearching for member with email: ${email}`);
    
    const member = await Member.findOne({ email: email.toLowerCase() });
    
    if (!member) {
      console.log('❌ Member not found!');
      return;
    }
    
    console.log('✅ Member found!');
    console.log('\n=== MEMBER DATA ===');
    console.log(`ID: ${member._id}`);
    console.log(`Full Name: ${member.fullName}`);
    console.log(`Email: ${member.email}`);
    console.log(`Paid: ${member.paid} (type: ${typeof member.paid})`);
    console.log(`Is Active: ${member.isActive} (type: ${typeof member.isActive})`);
    console.log(`Has Password: ${member.password ? 'Yes' : 'No'}`);
    console.log(`Paid Date: ${member.paidDate}`);
    
    console.log('\n=== PAYMENT CHECK SIMULATION ===');
    console.log(`!member.paid = ${!member.paid}`);
    console.log(`!member.isActive = ${!member.isActive}`);
    
    if (!member.paid) {
      console.log('❌ PAYMENT CHECK FAILED: Member would be denied access');
    } else {
      console.log('✅ PAYMENT CHECK PASSED: Member should have access');
    }
    
    if (!member.isActive) {
      console.log('❌ ACTIVE CHECK FAILED: Member account is inactive');
    } else {
      console.log('✅ ACTIVE CHECK PASSED: Member account is active');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
debugTestMember();