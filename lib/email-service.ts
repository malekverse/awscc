import nodemailer from 'nodemailer';
import { FormValues } from '@/app/join/page';

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

// HTML email template with branding
const createHtmlEmailContent = (userData: FormValues) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AWS Cloud Club!</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(to right, #9B6DFF, #7C4DFF);
          padding: 20px;
          text-align: center;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          border-left: 1px solid #E9E1FF;
          border-right: 1px solid #E9E1FF;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 15px 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-radius: 0 0 8px 8px;
          border: 1px solid #E9E1FF;
          border-top: none;
        }
        h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
        }
        h2 {
          color: #7C4DFF;
          margin-top: 0;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(to right, #9B6DFF, #7C4DFF);
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .benefits {
          background-color: #f9f5ff;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #7C4DFF;
        }
        .benefits ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .contact {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
          }
          .header {
            padding: 15px;
          }
          h1 {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://awscc.tn/logo.png" alt="AWS Cloud Club Logo" class="logo">
          <h1>Welcome to AWS Cloud Club!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userData.fullName},</h2>
          <p>Thank you for registering with the AWS Cloud Club! We're excited to have you join our community of cloud enthusiasts.</p>
          
          <p>Your membership registration has been successfully processed. Here's what you can expect as a member:</p>
          
          <div class="benefits">
            <strong>Club Benefits:</strong>
            <ul>
              <li>Access to exclusive workshops and training sessions</li>
              <li>Networking opportunities with industry professionals</li>
              <li>Hands-on experience with AWS technologies</li>
              <li>Collaboration on real-world cloud projects</li>
              <li>Preparation resources for AWS certifications</li>
            </ul>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <p>We'll be in touch soon with details about upcoming events and how you can get involved. In the meantime, you can:</p>
          <ul>
            <li>Follow us on social media for the latest updates</li>
            <li>Prepare for our next meeting (${userData.meetingPreference === 'inPerson' ? 'in-person' : userData.meetingPreference === 'online' ? 'online' : 'flexible format'})</li>
            <li>Start exploring AWS resources and documentation</li>
          </ul>
          
          <a href="https://awscc-isims.tn/resources" style="color: white; text-decoration: none;" class="button">Explore Us</a>
          
          <div class="contact">
            <p><strong>Need assistance?</strong></p>
            <p>If you have any questions or need support, please don't hesitate to contact us at:</p>
            <p>Email: <a href="mailto:awscc.isims@gmail.com">awscc.isims@gmail.com</a></p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
          <p>This email was sent to ${userData.email} because you registered for AWS Cloud Club membership.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plain text email version
const createTextEmailContent = (userData: FormValues) => {
  return `
    Welcome to AWS Cloud Club!
    
    Hello ${userData.fullName},
    
    Thank you for registering with the AWS Cloud Club! We're excited to have you join our community of cloud enthusiasts.
    
    Your membership registration has been successfully processed. Here's what you can expect as a member:
    
    Club Benefits:
    * Access to exclusive workshops and training sessions
    * Networking opportunities with industry professionals
    * Hands-on experience with AWS technologies
    * Collaboration on real-world cloud projects
    * Preparation resources for AWS certifications
    
    Next Steps:
    We'll be in touch soon with details about upcoming events and how you can get involved. In the meantime, you can:
    * Follow us on social media for the latest updates
    * Prepare for our next meeting (${userData.meetingPreference === 'inPerson' ? 'in-person' : userData.meetingPreference === 'online' ? 'online' : 'flexible format'})
    * Start exploring AWS resources and documentation
    
    Need assistance?
    If you have any questions or need support, please don't hesitate to contact us at:
    Email: awscc.isims@gmail.com
    
    © ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
    This email was sent to ${userData.email} because you registered for AWS Cloud Club membership.
  `;
};

// Send welcome email function
export const sendWelcomeEmail = async (userData: FormValues) => {
  try {
    // Skip sending in development if no email credentials
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER) {
      console.log('Development mode: Would have sent welcome email to', userData.email);
      console.log('To enable email sending, set the following environment variables:');
      console.log('- EMAIL_HOST');
      console.log('- EMAIL_PORT');
      console.log('- EMAIL_SECURE');
      console.log('- EMAIL_USER');
      console.log('- EMAIL_PASSWORD');
      return true;
    }
    
    // Prepare email options
    const mailOptions = {
      from: `"AWS Cloud Club" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: 'Welcome to Our Club!',
      text: createTextEmailContent(userData),
      html: createHtmlEmailContent(userData),
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error to prevent blocking form submission
    return false;
  }
};