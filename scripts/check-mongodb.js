// Script to verify MongoDB connection and check saved members
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in .env.local');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Define a simple schema for members (matching our actual schema)
    const memberSchema = new mongoose.Schema({
      fullName: String,
      email: String,
      phone: String,
      dob: String,
      role: String,
      organization: String,
      linkedin: String,
      experience: String,
      certifications: String,
      otherPlatforms: String,
      whyJoin: String,
      interests: [String],
      otherInterest: String,
      contribution: String,
      meetingPreference: String,
      heardFrom: String,
      otherSourceText: String,
      agreement: Boolean,
      paid: Boolean,
      submissionDate: Date,
      createdAt: Date,
      updatedAt: Date
    });
    
    // Create a model
    const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);
    
    // Count members
    const count = await Member.countDocuments();
    console.log(`Total members in database: ${count}`);
    
    // List the most recent members (up to 5)
    if (count > 0) {
      const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(5);
      console.log('\nMost recent members:');
      recentMembers.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.fullName} (${member.email})`);
        console.log(`   Joined: ${member.createdAt}`);
        console.log(`   Interests: ${member.interests.join(', ')}`);
        console.log(`   Paid: ${member.paid ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
connectToMongoDB();