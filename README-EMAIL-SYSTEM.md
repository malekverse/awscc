# Email Notification System for Form Submissions

This document explains how to set up the automated email notification system for the AWS Cloud Club membership form submissions.

## Overview

The email notification system sends a confirmation message to users upon successful form submission. The email includes:

- Website branding (colors, fonts, logo)
- Clear subject line: "Welcome to Our Club!"
- Personalized greeting with the user's name
- Confirmation of successful membership registration
- Brief introduction to club benefits
- Next steps and important information
- Contact details for support

The system provides both HTML and plain text versions of the email for maximum compatibility across email clients and devices.

## Prerequisites

1. An email account or SMTP service for sending emails
2. Access to environment variables for configuration

## Setup Instructions

### 1. Configure Environment Variables

Update your `.env.local` file with the following variables:

```
# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

Replace the values with:
- `EMAIL_HOST`: Your SMTP server hostname
- `EMAIL_PORT`: The port for your SMTP server (commonly 587 for TLS or 465 for SSL)
- `EMAIL_SECURE`: Set to "true" for SSL (port 465) or "false" for TLS (port 587)
- `EMAIL_USER`: Your email username or address
- `EMAIL_PASSWORD`: Your email password or app-specific password

### 2. Email Templates

The email templates are defined in `lib/email-service.ts`. They include:

- HTML template with responsive design and club branding
- Plain text alternative for email clients that don't support HTML

You can customize these templates to match your specific branding requirements.

### 3. Integration with Form Submission

The email notification system is integrated with the form submission process in `app/api/submit-form/route.ts`. When a form is successfully submitted:

1. The user data is saved to Google Sheets
2. A welcome email is sent to the user's email address
3. A success response is returned to the client

## Testing

1. Submit a form on your website
2. Check the email address you provided for the confirmation email
3. If there are any issues, check the server logs for error messages

## Troubleshooting

- Verify that the SMTP settings are correct for your email provider
- Check that the environment variables are set correctly
- If emails are not being sent in development mode, this is expected behavior (the system skips sending emails in development to avoid accidental emails)
- For production, ensure your email provider allows sending from your server IP address

## Security Considerations

- Never commit email credentials to your repository
- Consider using environment variables or a secrets manager for sensitive information
- Use app-specific passwords when possible instead of your main account password
- Implement rate limiting to prevent abuse of the email sending functionality

## Customization

To customize the email template:

1. Edit the HTML and plain text templates in `lib/email-service.ts`
2. Update the styling to match your brand colors and fonts
3. Modify the content to reflect your specific messaging

## Maintenance

Regularly review and update the email templates to ensure they remain relevant and effective. Consider A/B testing different versions to optimize user engagement.