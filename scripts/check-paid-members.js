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

async function checkPaidMembers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection successful!');

    // Count total members
    const totalCount = await Member.countDocuments();
    console.log(`Total members in database: ${totalCount}`);

    // Count paid members
    const paidCount = await Member.countDocuments({ paid: true });
    console.log(`Paid members: ${paidCount}`);

    // Count unpaid members
    const unpaidCount = await Member.countDocuments({ paid: false });
    console.log(`Unpaid members: ${unpaidCount}`);

    // Get all paid members
    if (paidCount > 0) {
      console.log('\nPaid members:');
      const paidMembers = await Member.find({ paid: true }).select('fullName email paid paidDate createdAt');
      
      paidMembers.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.fullName} (${member.email})`);
        console.log(`   Joined: ${member.createdAt}`);
        console.log(`   Paid: ${member.paid ? 'Yes' : 'No'}`);
        console.log(`   Paid Date: ${member.paidDate || 'Not set'}`);
      });
    } else {
      console.log('\nNo paid members found.');
    }

    // Get a few unpaid members for comparison
    console.log('\nSample unpaid members:');
    const unpaidMembers = await Member.find({ paid: false }).limit(3).select('fullName email paid paidDate createdAt');
    
    unpaidMembers.forEach((member, index) => {
      console.log(`\n${index + 1}. ${member.fullName} (${member.email})`);
      console.log(`   Joined: ${member.createdAt}`);
      console.log(`   Paid: ${member.paid ? 'Yes' : 'No'}`);
      console.log(`   Paid Date: ${member.paidDate || 'Not set'}`);
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkPaidMembers();