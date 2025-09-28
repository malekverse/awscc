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

async function fixTestMember() {
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
    
    // Update the member with missing required fields
    const updateData = {};
    
    if (testMember.agreedToTerms === undefined || testMember.agreedToTerms === null) {
      updateData.agreedToTerms = true;
      console.log('Setting agreedToTerms to true');
    }
    
    if (!testMember.role) {
      updateData.role = 'Member';
      console.log('Setting role to Member');
    }
    
    if (!testMember.experience) {
      updateData.experience = 'Beginner';
      console.log('Setting experience to Beginner');
    }
    
    if (!testMember.interests || testMember.interests.length === 0) {
      updateData.interests = ['Cloud Computing'];
      console.log('Setting interests to Cloud Computing');
    }
    
    if (!testMember.meetingPreference) {
      updateData.meetingPreference = 'Online';
      console.log('Setting meetingPreference to Online');
    }
    
    if (!testMember.heardFrom) {
      updateData.heardFrom = 'Other';
      console.log('Setting heardFrom to Other');
    }
    
    if (Object.keys(updateData).length > 0) {
      await Member.findByIdAndUpdate(testMember._id, updateData);
      console.log('\n✅ Test member updated successfully!');
    } else {
      console.log('\n✅ Test member already has all required fields!');
    }
    
    // Verify the update
    const updatedMember = await Member.findOne({ email: 'test@member.com' });
    console.log('\n=== UPDATED MEMBER DATA ===');
    console.log(`Full Name: ${updatedMember.fullName}`);
    console.log(`Email: ${updatedMember.email}`);
    console.log(`Role: ${updatedMember.role}`);
    console.log(`Experience: ${updatedMember.experience}`);
    console.log(`Interests: ${updatedMember.interests}`);
    console.log(`Meeting Preference: ${updatedMember.meetingPreference}`);
    console.log(`Heard From: ${updatedMember.heardFrom}`);
    console.log(`Agreed to Terms: ${updatedMember.agreedToTerms}`);
    console.log(`Paid: ${updatedMember.paid}`);
    console.log(`Is Active: ${updatedMember.isActive}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
fixTestMember();