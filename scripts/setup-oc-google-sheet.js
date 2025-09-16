require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function setupOCGoogleSheet() {
  try {
    console.log('Setting up OC Team Google Sheet...');
    
    // Check if environment variables are set
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID_OC) {
      console.error('Missing required environment variables. Please check your .env.local file.');
      console.log('Required variables:');
      console.log('- GOOGLE_SERVICE_ACCOUNT_EMAIL');
      console.log('- GOOGLE_PRIVATE_KEY');
      console.log('- GOOGLE_SHEET_ID_OC');
      return;
    }
    
    console.log('Using OC Sheet ID:', process.env.GOOGLE_SHEET_ID_OC);
    console.log('Using Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    
    // Create a JWT client using service account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize the sheet
    console.log('Connecting to Google Sheets...');
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID_OC, serviceAccountAuth);
    await doc.loadInfo(); // Load document properties and worksheets
    console.log(`Successfully connected to sheet: ${doc.title}`);
    
    // Get the first sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      console.log('No sheet found, creating a new one...');
      sheet = await doc.addSheet({ title: 'OC Team Event Registrations' });
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
      'Department',
      'Institute/City',
      'Paid'
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
      'Full Name': 'Test OC User',
      'Email': 'test-oc@example.com',
      'Phone': '123456789',
      'Department': 'logistics',
      'Institute/City': 'Test Institute',
      'Paid': 'No'
    });
    console.log('Test row added successfully!');
    
    console.log('OC Team Google Sheet setup completed successfully!');
  } catch (error) {
    console.error('Error setting up OC Team Google Sheet:', error);
  }
}

setupOCGoogleSheet();