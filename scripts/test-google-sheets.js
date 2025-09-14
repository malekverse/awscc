// Test script for Google Sheets integration
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testGoogleSheetsConnection() {
  try {
    console.log('Testing Google Sheets connection...');
    
    // Check if environment variables are set
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
    }
    
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY is not set');
    }
    
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID is not set');
    }
    
    console.log('Environment variables are set correctly.');
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
    
    // Fix for the private key format
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log('Private key format fixed.');
    
    // Create a JWT client using service account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    console.log('JWT client created successfully.');
    
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    console.log('Attempting to load document info...');
    
    await doc.loadInfo(); // Load document properties and worksheets
    console.log('Document loaded successfully!');
    console.log(`Document title: ${doc.title}`);
    
    // Get the first sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      console.log('No sheet found, creating a new one...');
      sheet = await doc.addSheet({ title: 'AWS Cloud Club Membership Applications' });
      
      // Add headers to the sheet
      await sheet.setHeaderRow([
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
      ]);
      console.log('Headers added to the new sheet.');
    } else {
      console.log(`Found existing sheet: ${sheet.title}`);
      console.log(`Row count: ${sheet.rowCount}`);
    }
    
    // Add a test row
    const testRow = await sheet.addRow({
      'Submission Date': new Date().toISOString(),
      'Full Name': 'Test User',
      'Email': 'test@example.com',
      'Phone': '1234567890',
      'Date of Birth': '2000-01-01',
      'Current Role': 'Student',
      'Organization': 'Test University',
      'LinkedIn': 'https://linkedin.com/in/testuser',
      'Experience Level': 'Beginner',
      'AWS Certifications': 'None',
      'Other Cloud Platforms': 'None',
      'Why Join': 'Testing',
      'Areas of Interest': 'EC2, S3',
      'Other Interests': '',
      'Contribution': 'Testing',
      'Meeting Preference': 'Online',
      'Heard From': 'Other',
      'Other Source': 'Test Script'
    });
    
    console.log('Test row added successfully!');
    console.log('Google Sheets connection test completed successfully!');
    
  } catch (error) {
    console.error('Error testing Google Sheets connection:', error);
  }
}

testGoogleSheetsConnection();