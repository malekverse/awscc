# Google Sheets Integration for Form Submissions

This document explains how to set up Google Sheets integration for the AWS Cloud Club membership form submissions.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename the spreadsheet to something like "AWS Cloud Club Membership Applications"
3. Note the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 2. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

### 3. Create Service Account Credentials

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "Service Account"
3. Fill in the service account details and click "Create"
4. Grant the service account the "Editor" role for the project
5. Click "Done"

### 4. Generate Service Account Key

1. In the Service Accounts list, click on the email address of the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type and click "Create"
5. The key file will be downloaded to your computer

### 5. Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click the "Share" button in the top-right corner
3. Enter the service account email address (found in the downloaded JSON key file)
4. Make sure the service account has "Editor" access
5. Click "Share"

### 6. Configure Environment Variables

1. Open the downloaded JSON key file
2. Update your `.env.local` file with the following variables:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
```

Replace the values with:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The email address of your service account
- `GOOGLE_PRIVATE_KEY`: The private key from the JSON file (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)
- `GOOGLE_SHEET_ID`: The ID of your Google Sheet from step 1

### 7. Deploy with Environment Variables

When deploying to production, make sure to set these environment variables in your hosting platform (Vercel, Netlify, etc.).

## Testing

1. Submit a form on your website
2. Check your Google Sheet to see if the data was added
3. If there are any issues, check the server logs for error messages

## Troubleshooting

- Make sure the Google Sheet is shared with the service account email
- Verify that the Google Sheets API is enabled in your Google Cloud project
- Check that the environment variables are set correctly
- Ensure the private key is properly formatted with newlines (`\n`)


## if you need to reset or set up a new Google Sheet in the future, you can run the setup script again using:
console
```
node scripts/setup-google-sheet.js
```