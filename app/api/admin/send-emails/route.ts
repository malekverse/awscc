import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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

// Verify admin authentication
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// Create HTML email template
function createEmailHTML(content: string, recipientName: string): string {
  const personalizedContent = content.replace(/{{name}}/g, recipientName);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AWS Cloud Club ISIMS</title>
      <style>
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
          white-space: pre-line;
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
        .contact-info {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #E9E1FF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AWS Cloud Club ISIMS</h1>
        </div>
        
        <div class="content">
          ${personalizedContent}
          
          <div class="contact-info">
            <p><strong>Contact Information:</strong></p>
            <p>Email: <a href="mailto:awscloudclubisims@gmail.com" style="color: #7C4DFF;">awscloudclubisims@gmail.com</a></p>
            <p>Website: <a href="https://awscc.tn" style="color: #7C4DFF;">awscc.tn</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
          <p>This email was sent from the AWS Cloud Club ISIMS admin panel.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Create plain text version
function createEmailText(content: string, recipientName: string): string {
  const personalizedContent = content.replace(/{{name}}/g, recipientName);
  
  return `
AWS Cloud Club ISIMS

${personalizedContent}

Contact Information:
Email: awscloudclubisims@gmail.com
Website: https://awscc.tn

© ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
This email was sent from the AWS Cloud Club ISIMS admin panel.
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { subject, content, recipients } = await request.json();

    if (!subject || !content || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
    }

    // Skip sending in development if no email credentials
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER) {
      console.log('Development mode: Would have sent emails to:', recipients.map(r => r.email));
      console.log('Subject:', subject);
      console.log('Content preview:', content.substring(0, 100) + '...');
      return NextResponse.json({ 
        message: 'Emails sent successfully (development mode)', 
        count: recipients.length 
      });
    }

    // Send emails
    const emailPromises = recipients.map(async (recipient: { email: string; name: string }) => {
      const mailOptions = {
        from: `"AWS Cloud Club ISIMS" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: subject,
        text: createEmailText(content, recipient.name),
        html: createEmailHTML(content, recipient.name),
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient.email}:`, info.messageId);
        return { email: recipient.email, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return { email: recipient.email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount > 0) {
      console.log('Some emails failed to send:', results.filter(r => !r.success));
    }

    return NextResponse.json({
      message: `Emails processed: ${successCount} sent, ${failureCount} failed`,
      successCount,
      failureCount,
      results
    });

  } catch (error) {
    console.error('Error in send-emails API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}