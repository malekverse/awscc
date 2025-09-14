import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { sendWelcomeEmail } from '@/lib/email-service';

// Initialize Google Sheets client
const initializeGoogleSheets = async () => {
  try {
    // Create JWT client
    const client = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', client);
    await doc.loadInfo(); // Load document properties and worksheets
    
    // Get the first sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'AWS Cloud Club Membership Applications' });
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
    
    // Check if headers exist by getting the first row
    await sheet.loadCells('A1:R1');
    const firstCell = sheet.getCell(0, 0);
    
    // If the first cell is empty, set the header row
    if (!firstCell.value) {
      console.log('Setting header row as it was not found');
      await sheet.setHeaderRow(headers);
    }
    
    return sheet;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw new Error('Failed to initialize Google Sheets');
  }
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the form data for debugging
    console.log('Form submission received:', data);
    
    // Prepare data for Google Sheets
    // Convert interests array to string
    const interestsString = Array.isArray(data.interests) ? data.interests.join(', ') : data.interests;
    
    // Format data for Google Sheets API
    const formattedData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      dob: data.dob,
      role: data.role,
      organization: data.organization || '',
      linkedin: data.linkedin || '',
      experience: data.experience,
      certifications: data.certifications || '',
      otherPlatforms: data.otherPlatforms || '',
      whyJoin: data.whyJoin,
      interests: interestsString,
      otherInterest: data.otherInterest || '',
      contribution: data.contribution,
      meetingPreference: data.meetingPreference,
      heardFrom: data.heardFrom,
      otherSourceText: data.otherSourceText || '',
      submissionDate: new Date().toISOString(),
    };
    
    // Check if we're in production or have Google Sheets credentials
    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
    ) {
      try {
        // Initialize Google Sheets
        const sheet = await initializeGoogleSheets();
        
        // Add the row to the sheet
        await sheet.addRow({
          'Submission Date': formattedData.submissionDate,
          'Full Name': formattedData.fullName,
          'Email': formattedData.email,
          'Phone': formattedData.phone,
          'Date of Birth': formattedData.dob,
          'Current Role': formattedData.role,
          'Organization': formattedData.organization,
          'LinkedIn': formattedData.linkedin,
          'Experience Level': formattedData.experience,
          'AWS Certifications': formattedData.certifications,
          'Other Cloud Platforms': formattedData.otherPlatforms,
          'Why Join': formattedData.whyJoin,
          'Areas of Interest': formattedData.interests,
          'Other Interests': formattedData.otherInterest,
          'Contribution': formattedData.contribution,
          'Meeting Preference': formattedData.meetingPreference,
          'Heard From': formattedData.heardFrom,
          'Other Source': formattedData.otherSourceText
        });
        
        console.log('Form data successfully added to Google Sheet');
      } catch (sheetError) {
        console.error('Error adding data to Google Sheet:', sheetError);
        // Return error response to client
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to save your application to our database. Please try again later.', 
            error: sheetError instanceof Error ? sheetError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      // In development or if credentials are missing, log the data
      console.log('Development mode or missing Google Sheets credentials. Would have saved:', formattedData);
      console.log('To enable Google Sheets integration, set the following environment variables:');
      console.log('- GOOGLE_SERVICE_ACCOUNT_EMAIL');
      console.log('- GOOGLE_PRIVATE_KEY');
      console.log('- GOOGLE_SHEET_ID');
      
      // Return error response to client in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Application system is currently unavailable. Please try again later or contact support.'
          },
          { status: 500 }
        );
      }
      // In development, we'll continue and return success
    }
    
    // Send welcome email
    try {
      await sendWelcomeEmail(data);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue with success response even if email fails
    }
    
    // Return success response
    return NextResponse.json({ success: true, message: 'Form submitted successfully' });
    
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit form' },
      { status: 500 }
    );
  }
}