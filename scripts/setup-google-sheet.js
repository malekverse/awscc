require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function setupGoogleSheet() {
  try {
    console.log('Setting up Google Sheet...');
    
    // Check if environment variables are set
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      console.error('Missing required environment variables. Please check your .env.local file.');
      console.log('Required variables:');
      console.log('- GOOGLE_SERVICE_ACCOUNT_EMAIL');
      console.log('- GOOGLE_PRIVATE_KEY');
      console.log('- GOOGLE_SHEET_ID');
      return;
    }
    
    console.log('Using Sheet ID:', process.env.GOOGLE_SHEET_ID);
    console.log('Using Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    
    // Create a JWT client using service account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize the sheet
    console.log('Connecting to Google Sheets...');
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); // Load document properties and worksheets
    console.log(`Successfully connected to sheet: ${doc.title}`);
    
    // Get the first sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      console.log('No sheet found, creating a new one...');
      sheet = await doc.addSheet({ title: 'AWS Cloud Club Membership Applications' });
      console.log('New sheet created with title:', sheet.title);
    } else {
      console.log('Using existing sheet:', sheet.title);
    }
    
    // Define the headers we want to use
    const headers = [
      'Submission Date',
      'Full Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Current Role',
      'Organization',
      'LinkedIn',
      'Experience Level',
      'AWS Certifications',
      'Other Cloud Platforms',
      'Why Join',
      'Areas of Interest',
      'Other Interests',
      'Contribution',
      'Meeting Preference',
      'Heard From',
      'Other Source'
    ];
    
    // Clear the sheet and set headers
    console.log('Setting up headers...');
    await sheet.clear();
    await sheet.setHeaderRow(headers);
    console.log('Headers successfully set up!');
    
    // Add a test row to verify everything is working
    console.log('Adding a test row...');
    await sheet.addRow({
      'Submission Date': new Date().toISOString(),
      'Full Name': 'Test User',
      'Email': 'test@example.com',
      'Phone': '123456789',
      'Date of Birth': '2000-01-01',
      'Current Role': 'Test Role',
      'Organization': 'Test Organization',
      'LinkedIn': 'https://linkedin.com/in/testuser',
      'Experience Level': 'beginner',
      'AWS Certifications': 'None',
      'Other Cloud Platforms': 'None',
      'Why Join': 'Testing the form submission',
      'Areas of Interest': 'compute, storage',
      'Other Interests': '',
      'Contribution': 'Testing contributions',
      'Meeting Preference': 'flexible',
      'Heard From': 'wordOfMouth',
      'Other Source': ''
    });
    console.log('Test row added successfully!');
    
    console.log('Google Sheet setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Google Sheet:', error);
  }
}

setupGoogleSheet();