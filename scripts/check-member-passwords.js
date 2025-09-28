const mongoose = require('mongoose');
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

async function checkMemberPasswords() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection successful!');

    // Get all paid members with password info
    const paidMembers = await Member.find({ paid: true }).select('fullName email paid isActive password temporaryPassword');
    
    console.log(`\nFound ${paidMembers.length} paid members:\n`);
    
    paidMembers.forEach((member, index) => {
      console.log(`${index + 1}. ${member.fullName} (${member.email})`);
      console.log(`   Paid: ${member.paid ? 'Yes' : 'No'}`);
      console.log(`   Active: ${member.isActive ? 'Yes' : 'No'}`);
      console.log(`   Has Password: ${member.password ? 'Yes' : 'No'}`);
      console.log(`   Has Temp Password: ${member.temporaryPassword ? 'Yes' : 'No'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
checkMemberPasswords();