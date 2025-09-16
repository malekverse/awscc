import nodemailer from 'nodemailer';
import { FormValues } from '@/app/join/page';
import { ContactFormValues } from '@/components/contact-form';
import Groq from 'groq-sdk';

// Define OCTeamFormValues interface
interface OCTeamFormValues {
  fullName: string;
  email: string;
  phone: string;
  department: 'Sponsoring' | 'Media' | 'Logistics';
  institute: string;
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
          <img src="https://awscc.tn/logo.png" alt="AWS Cloud Club Logo" class="logo">
          <h1>Welcome to the OC Team for ATNC!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userData.fullName},</h2>
          <p>We are glad to have you with us in the OC team for the AWS National Tunisia Camp (ATNC) event!</p>
          
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
            <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
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
    Submitted: ${new Date().toLocaleDateString()}
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