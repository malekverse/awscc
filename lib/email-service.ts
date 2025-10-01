import nodemailer from 'nodemailer';
import { FormValues } from '@/app/join/page';
import { ContactFormValues } from '@/components/contact-form';
import Groq from 'groq-sdk';
import QRCode from 'qrcode';

// Define OCTeamFormValues interface
interface OCTeamFormValues {
  fullName: string;
  email: string;
  phone: string;
  department: 'Sponsoring' | 'Media' | 'Logistics';
  institute: string;
}

// Define WelcomeEmailData interface for admin panel
interface WelcomeEmailData {
  to: string;
  memberName: string;
  email: string;
  temporaryPassword: string;
  dashboardUrl: string;
}

// Define GameInvitationData interface for game invitation emails
interface GameInvitationData {
  to: string;
  playerName: string;
  gameToken: string;
  gameUrl: string;
}

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
          color: black;
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
          
          <a href="https://awscc.tn" style="color: white; text-decoration: none;" class="button">Explore Us</a>
          
          <div class="contact">
            <p><strong>Need assistance?</strong></p>
            <p>If you have any questions or need support, please don't hesitate to contact us at:</p>
            <p>Email: <a href="mailto:awscloudclubisims@gmail.com">awscloudclubisims@gmail.com</a></p>
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

// HTML email template for OC Team registrations
const createOCTeamHtmlEmailContent = (userData: OCTeamFormValues) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to the OC Team for ATNC!</title>
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
          <img src="https://awscc.tn/awscc-logo.png" alt="AWS Cloud Club Logo" class="logo">
          <h1>Welcome to the OC Team for ATNC!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userData.fullName},</h2>
          <p>We are glad to have you with us in the OC team for the AWS TUNISIAN NATIONAL CAMP (ATNC) event!</p>
          
          <p>Your registration for the ${userData.department} department has been successfully processed.</p>
          
          <div class="benefits">
            <strong>Team Benefits:</strong>
            <ul>
              <li>Gain valuable event organization experience</li>
              <li>Network with AWS professionals and community leaders</li>
              <li>Contribute to the success of a national AWS event</li>
              <li>Develop teamwork and leadership skills</li>
              <li>Receive recognition for your contribution</li>
              <li>Receive an internship certificate from our partner S.A.S.</li>
              <li>Opportunity for employment with our partner S.A.S.</li>
              <li>Priority consideration for future events or projects with our partners</li>
            </ul>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <p>We'll be in touch soon with details about upcoming team meetings and your specific responsibilities. In the meantime, you can:</p>
          <ul>
            <li>Follow us on social media for the latest updates</li>
            <li>Prepare for your role in the ${userData.department} department</li>
            <li>Start thinking about ideas to contribute to the event</li>
          </ul>
          
          <a href="https://awscc.tn" style="color: white; text-decoration: none;" class="button">Learn More</a>
          
          <div class="contact">
            <p><strong>Need assistance?</strong></p>
            <p>If you have any questions or need support, please don't hesitate to contact us at:</p>
            <p>Email: <a href="mailto:awscloudclubisims@gmail.com">awscloudclubisims@gmail.com</a></p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
          <p>This email was sent to ${userData.email} because you registered for the OC team for the ATNC event.</p>
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
    Email: awscloudclubisims@gmail.com
    
    © ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
    This email was sent to ${userData.email} because you registered for AWS Cloud Club membership.
  `;
};

// Plain text email version for OC Team registrations
const createOCTeamTextEmailContent = (userData: OCTeamFormValues) => {
  return `
    Welcome to the OC Team for ATNC!
    
    Hello ${userData.fullName},
    
    We are glad to have you with us in the OC team for the AWS National Tunisia Camp (ATNC) event!
    
    Your registration for the ${userData.department} department has been successfully processed.
    
    Team Benefits:
    * Gain valuable event organization experience
    * Network with AWS professionals and community leaders
    * Contribute to the success of a national AWS event
    * Develop teamwork and leadership skills
    * Receive recognition for your contribution
    
    Next Steps:
    We'll be in touch soon with details about upcoming team meetings and your specific responsibilities. In the meantime, you can:
    * Follow us on social media for the latest updates
    * Prepare for your role in the ${userData.department} department
    * Start thinking about ideas to contribute to the event
    
    Need assistance?
    If you have any questions or need support, please don't hesitate to contact us at:
    Email: awscloudclubisims@gmail.com
    
    © ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
    This email was sent to ${userData.email} because you registered for the OC team for the ATNC event.
  `;
};

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate AI response using Groq
const generateAIResponse = async (contactData: ContactFormValues): Promise<string> => {
  try {
    const prompt = `You are the AWS Cloud Club ISIMS AI Assistant. A user has contacted us with the following information:

Name: ${contactData.name}
Email: ${contactData.email}
Company: ${contactData.company || 'Not specified'}
Subject: ${contactData.subject}
Message: ${contactData.message}

Generate a professional, helpful, and personalized response email. The response should:
1. Thank them for contacting AWS Cloud Club ISIMS
2. Acknowledge their specific inquiry or message
3. Provide relevant information or next steps based on their message
4. Maintain a professional yet friendly tone
5. Include appropriate contact information for follow-up
6. Be concise but comprehensive (200-400 words)

Sign the email as "AWS Cloud Club ISIMS AI Assistant".`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for AWS Cloud Club ISIMS. Respond to contact inquiries professionally and concisely.\n\nContact Information:\n- Email: awscloudclubisims@gmail.com\n- Website: awscc.tn\n- Join link: awscc.tn/join\n\nGuidelines:\n1. Keep responses short and to the point (2-3 sentences max)\n2. Be friendly but professional\n3. For membership: Direct to awscc.tn/join\n4. For updates: Mention awscc.tn website\n5. Include contact email only if specifically relevant\n6. Never include a subject line in your response\n7. Focus on actionable next steps\n\nExample response style:\n\"Thank you for your interest in AWS Cloud Club ISIMS! To join our community, please visit awscc.tn/join and complete the membership form. We'll review your application and get back to you soon.\""
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Return fallback message
    return `Thank you for contacting AWS Cloud Club ISIMS! We've received your message and will get back to you soon. Visit awscc.tn/join to join our community or check awscc.tn for updates.\n\nBest regards,\nAWS Cloud Club ISIMS Team`;
  }
};

// Create HTML email content for contact responses
const createContactHtmlEmailContent = (contactData: ContactFormValues, aiResponse: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you for contacting AWS Cloud Club ISIMS</title>
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
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
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
        .ai-response {
          background-color: #f9f5ff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #7C4DFF;
          white-space: pre-line;
        }
        .contact-info {
          background-color: #f0f9ff;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .footer-links {
          margin-top: 10px;
        }
        .footer-links a {
          color: #7C4DFF;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://awscc.tn/logo.png" alt="AWS Cloud Club Logo" class="logo">
          <h1>AWS Cloud Club ISIMS</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; color: white;">Thank you for contacting us!</p>
        </div>
        
        <div class="content">
          <div class="ai-response">
            ${aiResponse.replace(/\n/g, '<br>')}
          </div>
          
          <div class="contact-info">
            <h3 style="color: #7C4DFF; margin-top: 0;">Your Message Details:</h3>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <p><strong>Submitted:</strong> ${getCurrentLocalTime().toLocaleDateString()}</p>
            ${contactData.company ? `<p><strong>Company:</strong> ${contactData.company}</p>` : ''}
          </div>
          
          <p style="margin-top: 20px;">
            If you need immediate assistance or have additional questions, please don't hesitate to reach out to us directly:
          </p>
          
          <div class="contact-info">
            <p><strong>Email:</strong> awscloudclubisims@gmail.com</p>
            <p><strong>Website:</strong> <a href="https://awscc.tn" style="color: #7C4DFF;">awscc.tn</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
          <p>This email was sent to ${contactData.email} in response to your contact form submission.</p>
          <div class="footer-links">
            <a href="https://awscc.tn/politique-de-confidentialite">Privacy Policy</a>
            <a href="https://awscc.tn/conditions-utilisation">Terms of Use</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create plain text email content for contact responses
const createContactTextEmailContent = (contactData: ContactFormValues, aiResponse: string) => {
  return `
    AWS Cloud Club ISIMS - Thank you for contacting us!
    
    ${aiResponse}
    
    Your Message Details:
    Subject: ${contactData.subject}
    Submitted: ${getCurrentLocalTime().toLocaleDateString()}
    ${contactData.company ? `Company: ${contactData.company}` : ''}
    
    If you need immediate assistance or have additional questions, please contact us:
    Email: awscloudclubisims@gmail.com
    Website: https://awscc.tn
    
    © ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
    This email was sent to ${contactData.email} in response to your contact form submission.
  `;
};

// Send contact email function
export const sendContactEmail = async (contactData: ContactFormValues) => {
  try {
    // Skip sending in development if no email credentials
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER) {
      console.log('Development mode: Would have sent contact response email to', contactData.email);
      console.log('Contact details:', {
        name: contactData.name,
        subject: contactData.subject,
        company: contactData.company
      });
      return true;
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(contactData);
    
    // Prepare email options
    const mailOptions = {
      from: `"AWS Cloud Club ISIMS AI Assistant" <${process.env.EMAIL_USER}>`,
      to: contactData.email,
      subject: `Re: ${contactData.subject} - AWS Cloud Club ISIMS`,
      text: createContactTextEmailContent(contactData, aiResponse),
      html: createContactHtmlEmailContent(contactData, aiResponse),
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact response email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    // Don't throw error to prevent blocking form submission
    return false;
  }
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
      date: getCurrentLocalTime(), // Set proper local timezone for email timestamp
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

// Send OC Team welcome email function
export const sendOCTeamWelcomeEmail = async (userData: OCTeamFormValues) => {
  try {
    // Skip sending in development if no email credentials
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER) {
      console.log('Development mode: Would have sent OC Team welcome email to', userData.email);
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
      subject: 'Welcome to the OC Team for ATNC!',
      text: createOCTeamTextEmailContent(userData),
      html: createOCTeamHtmlEmailContent(userData),
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('OC Team welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OC Team welcome email:', error);
    // Don't throw error to prevent blocking form submission
    return false;
  }
};

// Generate member welcome email HTML template
const generateMemberWelcomeEmailHTML = (data: WelcomeEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AWSCC - Membership Activated</title>
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
          padding: 12px 30px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .credentials {
          background-color: #f9f5ff;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #7C4DFF;
        }
        .messenger-section {
          background: linear-gradient(135deg, #00B2FF 0%, #006AFF 50%, #0084FF 100%);
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          color: white;
          text-align: center;
        }
        .messenger-button {
          display: inline-block;
          background: linear-gradient(135deg, #0084FF 0%, #00B2FF 100%);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-weight: bold;
          margin: 15px 0;
          box-shadow: 0 4px 15px rgba(0, 132, 255, 0.3);
          transition: transform 0.2s ease;
        }
        .messenger-button:hover {
          transform: translateY(-2px);
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
          <h1>Welcome to AWSCC!</h1>
          <p style="color: white;">Your membership has been activated</p>
        </div>
        <div class="content">
          <h2>Hello ${data.memberName},</h2>
          
          <p>Congratulations! Your payment has been confirmed and your AWSCC membership is now active.</p>
          
          <p>You now have access to our exclusive member dashboard where you can:</p>
          <ul>
            <li>Access member-only resources and documentation</li>
            <li>Connect with other AWS professionals and enthusiasts</li>
            <li>Stay updated with the latest AWS news and events</li>
            <li>Participate in exclusive workshops and training sessions</li>
            <li>Access certification preparation materials</li>
          </ul>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${data.temporaryPassword}</code></p>
            <p><em>Please change your password after your first login for security.</em></p>
          </div>
          
          <div class="messenger-section">
            <h3 style="margin-top: 0; color: white;">💬 Join Our Exclusive Messenger Group!</h3>
            <p style="margin: 10px 0;">Connect with fellow AWSCC members, share knowledge, and stay updated with the latest discussions in our private Messenger group.</p>
            <div style="margin: 15px 0;">
              <a href="https://m.me/j/AbayMZ1I7Q--fLaO/" style="color: white; text-decoration: none;" class="messenger-button">Join Messenger Group</a>
            </div>
            <p style="font-size: 14px; margin-bottom: 0; opacity: 0.9; color: white;"><em>This is an exclusive group for paid members only.</em></p>
          </div>
          
          <p style="text-align: center;">
            <a href="${data.dashboardUrl}" style="color: white; text-decoration: none;" class="button">Access Your Dashboard</a>
          </p>
          
          <div class="contact">
            <p><strong>Need assistance?</strong></p>
            <p>If you have any questions or need support, please don't hesitate to contact us at:</p>
            <p>Email: <a href="mailto:awscloudclubisims@gmail.com" style="color: #7C4DFF;">awscloudclubisims@gmail.com</a></p>
          </div>
          
          <p>Welcome to the AWSCC community!</p>
          
          <p>Best regards,<br>
          The AWS Cloud Club ISIMS Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
          <p>This email was sent to ${data.email} because your AWSCC membership was activated.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate member welcome email text template
const generateMemberWelcomeEmailText = (data: WelcomeEmailData): string => {
  return `
AWS Cloud Club ISIMS - Welcome to AWSCC!

Hello ${data.memberName},

Congratulations! Your payment has been confirmed and your AWSCC membership is now active.

You now have access to our exclusive member dashboard where you can:
- Access member-only resources and documentation
- Connect with other AWS professionals and enthusiasts
- Stay updated with the latest AWS news and events
- Participate in exclusive workshops and training sessions
- Access certification preparation materials

Your Login Credentials:
Email: ${data.email}
Temporary Password: ${data.temporaryPassword}

Please change your password after your first login for security.

💬 JOIN OUR EXCLUSIVE MESSENGER GROUP!
Connect with fellow AWSCC members, share knowledge, and stay updated with the latest discussions in our private Messenger group.

Messenger Group Link: https://m.me/j/AbayMZ1I7Q--fLaO/
(This is an exclusive group for paid members only)

Access your dashboard at: ${data.dashboardUrl}

Need assistance?
If you have any questions or need support, please don't hesitate to contact us at:
Email: awscloudclubisims@gmail.com

Welcome to the AWSCC community!

Best regards,
The AWS Cloud Club ISIMS Team

© ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
This email was sent to ${data.email} because your AWSCC membership was activated.
  `;
};

// Send member welcome email with login credentials
export const sendMemberWelcomeEmail = async (data: WelcomeEmailData): Promise<void> => {
  try {
    const mailOptions = {
      from: `"AWSCC" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: 'Welcome to AWSCC - Your Membership is Active!',
      text: generateMemberWelcomeEmailText(data),
      html: generateMemberWelcomeEmailHTML(data)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Member welcome email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Failed to send member welcome email:', error);
    throw new Error('Failed to send member welcome email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"AWSCC" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - AWSCC',
      text: `
AWS Cloud Club ISIMS - Password Reset Request

Hello,

You have requested to reset your password for your AWSCC account. We're here to help you regain access to your account.

Please visit the following link to create a new password:
${resetUrl}

SECURITY NOTICE:
- This link will expire in 1 hour for your security
- If you didn't request this reset, please ignore this email
- Your current password remains unchanged until you create a new one

Need assistance?
If you have any questions or need support, please contact us at:
Email: hello@awscc.tn

Best regards,
The AWS Cloud Club ISIMS Team

© ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
This email was sent because a password reset was requested for your AWSCC account.
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request - AWSCC</title>
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
              padding: 12px 30px;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 16px;
            }
            .security-notice {
              background-color: #fff3cd;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              border-left: 4px solid #ffc107;
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
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You have requested to reset your password for your AWSCC account. We're here to help you regain access to your account.</p>
              
              <p>Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" style="color: white; text-decoration: none;" class="button">Reset Password</a>
              </p>
              
              <div class="security-notice">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in <strong>1 hour</strong> for your security</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your current password remains unchanged until you create a new one</li>
                </ul>
              </div>
              
              <div class="contact">
                <p><strong>Need assistance?</strong></p>
                <p>If you have any questions or need support, please don't hesitate to contact us at:</p>
                <p>Email: <a href="mailto:hello@awscc.tn" style="color: #7C4DFF;">hello@awscc.tn</a></p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${getCurrentLocalTime().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
              <p>This email was sent because a password reset was requested for your AWSCC account.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Game invitation email function
export const sendGameInvitationEmail = async (data: GameInvitationData): Promise<void> => {
  try {
    // Generate QR code for the game URL
    const qrCodeDataUrl = await QRCode.toDataURL(data.gameUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#7C4DFF',
        light: '#FFFFFF'
      }
    });

    const mailOptions = {
      from: `"AWS Cloud Club" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: '🎮 Welcome to Cloud Conquest - Your Adventure Awaits!',
      date: getCurrentLocalTime(), // Set proper local timezone for email timestamp
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cloud Conquest - Game Invitation</title>
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
              background: linear-gradient(135deg, #9B6DFF, #7C4DFF, #FF6B6B);
              padding: 30px 20px;
              text-align: center;
              color: white;
              border-radius: 8px 8px 0 0;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="80" r="2.5" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            }
            .content {
              padding: 30px 20px;
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
              font-size: 28px;
              position: relative;
              z-index: 1;
            }
            h2 {
              color: #7C4DFF;
              margin-top: 0;
              font-size: 24px;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 15px;
              position: relative;
              z-index: 1;
            }
            .game-info {
              background: linear-gradient(135deg, #f8f5ff, #fff5f5);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 5px solid #7C4DFF;
              box-shadow: 0 4px 15px rgba(124, 77, 255, 0.1);
            }
            .qr-section {
              text-align: center;
              background: #ffffff;
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border: 2px dashed #7C4DFF;
              box-shadow: 0 4px 15px rgba(124, 77, 255, 0.1);
            }
            .qr-code {
              max-width: 200px;
              height: auto;
              margin: 15px 0;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #9B6DFF, #7C4DFF);
              color: white;
              text-decoration: none;
              padding: 15px 35px;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 18px;
              box-shadow: 0 4px 15px rgba(124, 77, 255, 0.3);
              transition: all 0.3s ease;
            }
            .game-features {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 20px 0;
            }
            .feature {
              background: #f8f5ff;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #E9E1FF;
            }
            .feature-icon {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .contact {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #eee;
            }
            .game-token {
              background: #2d3748;
              color: #ffffff;
              padding: 10px 15px;
              border-radius: 6px;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              letter-spacing: 1px;
              margin: 10px 0;
              text-align: center;
              border: 2px solid #7C4DFF;
            }
            @media only screen and (max-width: 600px) {
              .container {
                width: 100%;
                padding: 10px;
              }
              .header {
                padding: 20px 15px;
              }
              h1 {
                font-size: 24px;
              }
              .game-features {
                grid-template-columns: 1fr;
              }
              .content {
                padding: 20px 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://awscc.tn/logo.png" alt="AWS Cloud Club Logo" class="logo">
              <h1>🎮 Cloud Conquest</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; position: relative; z-index: 1;">Your AWS Adventure Begins Now!</p>
            </div>
            <div class="content">
              <h2>Welcome, ${data.playerName}! 🚀</h2>
              <p>Congratulations on joining the AWS Cloud Club! As a special welcome gift, you've been invited to participate in our exclusive <strong>Cloud Conquest</strong> scavenger hunt game.</p>
              
              <div class="game-info">
                <h3 style="color: #7C4DFF; margin-top: 0;">🎯 Your Mission</h3>
                <p>Embark on an exciting journey through 5 challenging stations, each designed to test your cloud knowledge and problem-solving skills. Collect badges, solve puzzles, and become a true AWS Cloud Conqueror!</p>
                
                <div class="game-features">
                  <div class="feature">
                    <div class="feature-icon">🏆</div>
                    <strong>5 Stations</strong><br>
                    <small>Unique challenges await</small>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">🎖️</div>
                    <strong>Collect Badges</strong><br>
                    <small>Prove your skills</small>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">🧩</div>
                    <strong>Solve Puzzles</strong><br>
                    <small>Test your knowledge</small>
                  </div>
                  <div class="feature">
                    <div class="feature-icon">📜</div>
                    <strong>Win Certificate</strong><br>
                    <small>Digital achievement</small>
                  </div>
                </div>
              </div>

              <div class="qr-section">
                <h3 style="color: #7C4DFF; margin-top: 0;">📱 Start Your Adventure</h3>
                <div class="game-token">
                  Game Token: ${data.gameToken}
                </div>
                <p style="text-align: center;">
                  <a href="${data.gameUrl}" style="color: white; text-decoration: none;" class="button">🎮 Start Game</a>
                </p>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                  <em>💡 Tip: Save this email! You'll need your game token to continue if you close the browser.</em>
                </p>
              </div>

              <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <strong>🎯 Game Rules:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Complete all 5 stations to win your digital certificate</li>
                  <li>Each station must be unlocked by scanning the correct QR code</li>
                  <li>Work at your own pace - the game saves your progress</li>
                  <li>Have fun and learn something new about AWS!</li>
                </ul>
              </div>
              
              <div class="contact">
                <p><strong>Need assistance?</strong></p>
                <p>If you have any questions about the game or need technical support, please contact us at:</p>
                <p>Email: <a href="mailto:awscloudclubisims@gmail.com" style="color: #7C4DFF;">awscloudclubisims@gmail.com</a></p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
              <p>This email was sent because you registered for AWS Cloud Club membership.</p>
              <p style="margin-top: 10px;">🎮 Good luck, Cloud Conqueror!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Game invitation email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('Failed to send game invitation email:', error);
    throw new Error('Failed to send game invitation email');
  }
};