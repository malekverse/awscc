const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

// Helper function to get current time in Tunisia timezone (UTC+1)
const getCurrentLocalTime = () => {
  const now = new Date();
  
  // Get timezone from environment variable or default to Africa/Tunis
  const timezone = process.env.APP_TIMEZONE || 'Africa/Tunis';
  
  // Use Intl.DateTimeFormat to properly handle timezone conversion
  // This works correctly regardless of server timezone (UTC on Vercel, UTC+1 locally)
  const tunisiaTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now);
  
  // Reconstruct the date in Tunisia timezone
  const year = parseInt(tunisiaTime.find(part => part.type === 'year')?.value || '');
  const month = parseInt(tunisiaTime.find(part => part.type === 'month')?.value || '') - 1; // Month is 0-indexed
  const day = parseInt(tunisiaTime.find(part => part.type === 'day')?.value || '');
  const hour = parseInt(tunisiaTime.find(part => part.type === 'hour')?.value || '');
  const minute = parseInt(tunisiaTime.find(part => part.type === 'minute')?.value || '');
  const second = parseInt(tunisiaTime.find(part => part.type === 'second')?.value || '');
  
  return new Date(year, month, day, hour, minute, second);
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