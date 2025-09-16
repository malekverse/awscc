// Script to check MongoDB connection and OCTeamMember data
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the OCTeamMember schema for this script
const OCTeamMemberSchema = new Schema({
  fullName: String,
  email: String,
  phone: String,
  department: String,
  institute: String,
  paid: Boolean,
  submissionDate: Date,
});

// Create the model
const OCTeamMember = mongoose.model('OCTeamMember', OCTeamMemberSchema);

async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connection successful!');

    // Count OCTeamMembers
    const count = await OCTeamMember.countDocuments();
    console.log(`Number of OC Team members in the database: ${count}`);

    // Get the most recent OCTeamMembers (up to 5)
    if (count > 0) {
      console.log('\nMost recent OC Team members:');
      const members = await OCTeamMember.find().sort({ submissionDate: -1 }).limit(5);
      
      members.forEach((member, index) => {
        console.log(`\n--- Member ${index + 1} ---`);
        console.log(`Name: ${member.fullName}`);
        console.log(`Email: ${member.email}`);
        console.log(`Phone: ${member.phone}`);
        console.log(`Department: ${member.department}`);
        console.log(`Institute/City: ${member.institute}`);
        console.log(`Paid: ${member.paid ? 'Yes' : 'No'}`);
        console.log(`Submission Date: ${member.submissionDate}`);
      });
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nMongoDB connection disconnected.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();