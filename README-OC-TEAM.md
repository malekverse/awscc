# OC Team Event Registration Form

This document provides information about the OC Team Event Registration form implementation.

## Overview

The OC Team Event Registration form allows participants to register for the OC team event by providing their personal information and selecting their preferred department.

## Form Location

The form is accessible at: `/atnc/oc/join`

## Form Fields

The registration form includes the following fields:

- **Full Name** (required): The participant's full legal name
- **Email** (required): The participant's email address for communication
- **Phone Number** (required): The participant's contact phone number
- **Department** (required): The department the participant is interested in joining
  - Options: Sponsoring, Media, Logistics
- **Institute/City** (required): The participant's institute or city of residence
- **CV/Resume**: Upload CV or resume in PDF or Word format (max 5MB) - Optional
- **Professional Photo** (required): Upload a professional headshot photo in JPEG or PNG format (max 2MB)
  - **Note**: This photo will be used for event badges and may be featured in the ATNC website team section

## Data Storage

### MongoDB

Participant data is stored in MongoDB using the `OCTeamMember` model with the following schema:

```typescript
interface IOCTeamMember {
  fullName: string;
  email: string;
  phone: string;
  department: 'Sponsoring' | 'Media' | 'Logistics';
  institute: string;
  cvFileName?: string;
  photoFileName: string;
  submissionDate: Date;
  paid: boolean; // Default: false
}
```

### Google Sheets

Participant data is also stored in a Google Sheet with the following columns:

- Submission Date
- Full Name
- Email
- Phone
- Department
- Institute/City
- CV File
- Photo File
- Paid (Yes/No)

### File Storage

Uploaded files (CV and photos) are stored in the `/public/uploads/atnc-oc-team/` directory with unique filenames that include:
- File type prefix (cv_ or photo_)
- Sanitized email address
- Timestamp
- Original file extension

Example: `cv_user_example_com_1703123456789.pdf`

## API Endpoint

Form submissions are processed by the `/api/submit-oc-form` API endpoint, which:

1. Validates the submitted data
2. Saves the data to MongoDB
3. Adds a row to the Google Sheet
4. Sends a confirmation email to the participant
5. Returns a success/error response

## Testing

You can test the MongoDB connection and view OC Team members using the script:

```bash
node scripts/check-oc-mongodb.js
```

This script will display:
- The number of OC Team members in the database
- Details of the most recent OC Team members (up to 5)

## Paid Status

All registrations have a `paid` field that defaults to `false`. This can be updated manually in the database or through an admin interface (not implemented yet).