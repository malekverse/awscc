const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

// Helper function to get current time in local timezone
const getCurrentLocalTime = () => {
  const now = new Date();
  // Convert to Tunisia timezone (UTC+1)
  const tunisiaTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
  return tunisiaTime;
};

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function testEmailTimezone() {
  try {
    console.log('Testing email timezone fix...');
    console.log('Current system time:', new Date().toString());
    console.log('Tunisia local time:', getCurrentLocalTime().toString());
    
    const testEmail = {
      from: `"AWS Cloud Club Test" <${process.env.EMAIL_USER}>`,
      to: 'sleepyloko32@gmail.com', // Your email for testing
      subject: '🧪 Timezone Test Email - ' + getCurrentLocalTime().toLocaleTimeString(),
      date: getCurrentLocalTime(), // Set proper local timezone for email timestamp
      html: `
        <h2>Email Timezone Test</h2>
        <p><strong>System UTC Time:</strong> ${new Date().toString()}</p>
        <p><strong>Tunisia Local Time:</strong> ${getCurrentLocalTime().toString()}</p>
        <p><strong>Email Sent At:</strong> ${getCurrentLocalTime().toLocaleString()}</p>
        <p>This email should now show the correct send time in your Outlook.</p>
        <hr>
        <p><small>Test sent at ${getCurrentLocalTime().toLocaleTimeString()}</small></p>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Email should appear in Outlook with correct timestamp:', getCurrentLocalTime().toLocaleString());
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

testEmailTimezone();