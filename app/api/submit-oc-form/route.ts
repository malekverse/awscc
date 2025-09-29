import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { sendOCTeamWelcomeEmail } from '@/lib/email-service';
import { connectToDatabase } from '@/lib/mongodb';
import OCTeamMember from '@/models/OCTeamMember';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID_OC || '', client);
    await doc.loadInfo(); // Load document properties and worksheets
    
    // Get the OC Team sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'OC Team Event Registrations' });
    }
    
    // Define the headers we want to use
    const headers = [
      'Submission Date',
      'Full Name',
      'Email',
      'Phone',
      'Department',
      'Institute/City',
      'CV File',
      'Photo File',
      'Paid'
    ];
    
    // Check if headers exist by getting the first row
    await sheet.loadCells('A1:G1');
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
    const formData = await request.formData();
    
    // Extract form fields
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      department: formData.get('department') as string,
      institute: formData.get('institute') as string,
    };
    
    // Extract files
    const cvFile = formData.get('cv') as File | null;
    const photoFile = formData.get('photo') as File | null;
    
    // Log the form data for debugging
    console.log('OC Team form submission received:', data);
    console.log('Files received:', { cv: cvFile?.name, photo: photoFile?.name });
    
    // Handle file uploads
    let cvFileName = '';
    let photoFileName = '';
    
    if (!photoFile) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Photo file is required.'
        },
        { status: 400 }
      );
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'atnc-oc-team');
      await mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filenames
      const timestamp = Date.now();
      const sanitizedEmail = data.email.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Save CV file if provided
      if (cvFile) {
        const cvExtension = path.extname(cvFile.name);
        cvFileName = `cv_${sanitizedEmail}_${timestamp}${cvExtension}`;
        const cvPath = path.join(uploadsDir, cvFileName);
        const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
        await writeFile(cvPath, cvBuffer);
      }
      
      // Save photo file (required)
      const photoExtension = path.extname(photoFile.name);
      photoFileName = `photo_${sanitizedEmail}_${timestamp}${photoExtension}`;
      const photoPath = path.join(uploadsDir, photoFileName);
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      await writeFile(photoPath, photoBuffer);
      
      console.log('Files saved successfully:', { cv: cvFileName || 'none', photo: photoFileName });
    } catch (fileError) {
      console.error('Error saving files:', fileError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to save uploaded files. Please try again.'
        },
        { status: 500 }
      );
    }
    
    // Format data for storage
    const formattedData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      department: data.department,
      institute: data.institute,
      ...(cvFileName && { cvFileName }),
      photoFileName: photoFileName,
      submissionDate: new Date().toISOString(),
      paid: false,
    };
    
    // Connect to MongoDB and save the member data
    try {
      await connectToDatabase();
      
      // Create a new OC team member document
      const newOCTeamMember = new OCTeamMember({
        fullName: formattedData.fullName,
        email: formattedData.email,
        phone: formattedData.phone,
        department: formattedData.department,
        institute: formattedData.institute,
        cvFileName: formattedData.cvFileName,
        photoFileName: formattedData.photoFileName,
        paid: formattedData.paid,
        submissionDate: new Date(formattedData.submissionDate)
      });
      
      // Save the member to MongoDB
      await newOCTeamMember.save();
      console.log('OC Team member data saved to MongoDB successfully');
    } catch (mongoError) {
      console.error('Error saving to MongoDB:', mongoError);
      // Continue with the process even if MongoDB fails
      // We'll still try to save to Google Sheets as a backup
    }
    
    // Check if we're in production or have Google Sheets credentials
    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID_OC
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
          'Department': formattedData.department,
          'Institute/City': formattedData.institute,
          'CV File': formattedData.cvFileName || 'Not provided',
          'Photo File': formattedData.photoFileName,
          'Paid': formattedData.paid ? 'Yes' : 'No'
        });
        
        console.log('OC Team form data successfully added to Google Sheet');
      } catch (sheetError) {
        console.error('Error adding data to Google Sheet:', sheetError);
        // Return error response to client
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to save your registration to our database. Please try again later.', 
            error: sheetError instanceof Error ? sheetError.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      // In development or if credentials are missing, log the data
      console.log('Development mode or missing Google Sheets credentials. Would have saved:', formattedData);
      
      // Return error response to client in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Registration system is currently unavailable. Please try again later or contact support.'
          },
          { status: 500 }
        );
      }
      // In development, we'll continue and return success
    }
    
    // Send OC team welcome email
    try {
      await sendOCTeamWelcomeEmail(data);
      console.log('OC team welcome email sent successfully');
    } catch (error) {
      console.error('Error sending OC team welcome email:', error);
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