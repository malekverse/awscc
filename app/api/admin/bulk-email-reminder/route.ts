import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAdminAuth } from '@/lib/auth';
import Member from '@/models/Member';

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



// Create HTML email template
function createReminderEmailHTML(content: string, recipientName: string, templateType: string = 'custom', customButton?: { text: string; url: string }): string {
  // Replace all template variables
  let personalizedContent = content
    .replace(/{{MEMBER_NAME}}/g, recipientName)
    .replace(/{{name}}/g, recipientName)
    .replace(/{{CUSTOM_CONTENT}}/g, content.replace(/{{MEMBER_NAME}}/g, recipientName).replace(/{{name}}/g, recipientName));
  
  // Process rich text formatting
  personalizedContent = personalizedContent
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/^- (.+)$/gm, '<li>$1</li>') // Bullet points
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>') // Numbered lists
    .replace(/(<li>.*<\/li>)/gs, '<ul style="margin: 10px 0; padding-left: 20px;">$1</ul>'); // Wrap lists
  
  // Template-specific styling and icons
  const templateConfig = {
    event: {
      color: '#7C4DFF',
      icon: '📅',
      bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
    },
    announcement: {
      color: '#7C4DFF',
      icon: '📢',
      bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
    },
    reminder: {
      color: '#7C4DFF',
      icon: '🔔',
      bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
    },
    custom: {
      color: '#7C4DFF',
      icon: '✉️',
      bgGradient: 'linear-gradient(to right, #9B6DFF, #7C4DFF)'
    }
  };

  const config = templateConfig[templateType as keyof typeof templateConfig] || templateConfig.custom;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AWS Cloud Club ISIMS</title>
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
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: ${config.bgGradient};
          padding: 30px 20px;
          text-align: center;
          color: white;
          border-radius: 10px 10px 0 0;
          position: relative;
        }
        .logo {
          width: 60px;
          height: 60px;
          margin-bottom: 15px;
        }
        .template-icon {
          font-size: 48px;
          margin-bottom: 15px;
          display: block;
        }
        h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px 25px;
          background-color: #ffffff;
        }
        .message-content {
          background-color: #f8f9fa;
          border-left: 4px solid ${config.color};
          padding: 20px;
          margin: 25px 0;
          border-radius: 6px;
          white-space: pre-line;
          font-size: 16px;
          line-height: 1.7;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: ${config.bgGradient};
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s ease;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .contact {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 2px solid #f0f0f0;
          background-color: #fafafa;
          padding: 25px;
          border-radius: 8px;
        }
        .contact h3 {
          color: ${config.color};
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .contact p {
          margin: 8px 0;
          font-size: 15px;
        }
        .contact a {
          color: ${config.color};
          text-decoration: none;
          font-weight: 500;
        }
        .footer {
          background: linear-gradient(135deg, #9B6DFF 0%, #7C4DFF 100%);
          padding: 25px;
          text-align: center;
          font-size: 14px;
          color: white;
          border-radius: 0 0 10px 10px;
          margin-top: 0;
        }
        .footer p {
          margin: 8px 0;
          opacity: 0.9;
        }
        .footer a {
          color: #ffffff;
          text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            margin: 10px;
            padding: 10px;
          }
          .header {
            padding: 20px 15px;
          }
          .content {
            padding: 20px 15px;
          }
          h1 {
            font-size: 24px;
          }
          .template-icon {
            font-size: 36px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
            <img src="https://awscc.tn/images/awscc-logo.jpg" alt="AWS Cloud Club ISIMS" class="logo" style="width: 80px; height: 80px; margin-bottom: 15px; border-radius: 10px;">
            <h1>AWS Cloud Club ISIMS</h1>
          </div>
        
        <div class="content">
          <div class="message-content">
            ${personalizedContent}
          </div>
          
          <p style="text-align: center;">
            ${customButton && customButton.text && customButton.url 
              ? `<a href="${customButton.url}" class="button">${customButton.text}</a>`
              : `<a href="https://awscc.tn" class="button">Visit Our Website</a>`
            }
          </p>
          
          <div class="contact">
            <h3>Need Assistance?</h3>
            <p>If you have any questions or need support, please don't hesitate to contact us:</p>
            <p><strong>Email:</strong> <a href="mailto:awscloudclubisims@gmail.com">awscloudclubisims@gmail.com</a></p>
            <p><strong>Website:</strong> <a href="https://awscc.tn">awscc.tn</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.</p>
          <p>This email was sent to you as a member of AWS Cloud Club ISIMS.</p>
          <p>You received this email from our admin panel notification system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Create plain text version
function createReminderEmailText(content: string, recipientName: string): string {
  // Replace all template variables
  const personalizedContent = content
    .replace(/{{MEMBER_NAME}}/g, recipientName)
    .replace(/{{name}}/g, recipientName)
    .replace(/{{CUSTOM_CONTENT}}/g, content.replace(/{{MEMBER_NAME}}/g, recipientName).replace(/{{name}}/g, recipientName));
  
  return `
AWS Cloud Club ISIMS

${personalizedContent}

Visit Our Website: https://awscc.tn

Need Assistance?
If you have any questions or need support, please don't hesitate to contact us:

Email: awscloudclubisims@gmail.com
Website: https://awscc.tn

© ${new Date().getFullYear()} AWS Cloud Club ISIMS. All rights reserved.
This email was sent to you as a member of AWS Cloud Club ISIMS.
You received this email from our admin panel notification system.
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { 
      subject, 
      message, 
      templateType = 'custom',
      recipientType = 'all',
      selectedMembers = [],
      customButton
    } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    if (recipientType !== 'all' && (!selectedMembers || selectedMembers.length === 0)) {
      return NextResponse.json({ error: 'Selected members are required for non-all recipient types' }, { status: 400 });
    }

    // Connect to database and fetch members based on recipient type
    await connectToDatabase();
    
    let members;
    if (recipientType === 'all') {
      members = await Member.find({ 
        email: { $exists: true, $ne: '' } 
      }).select('fullName email').lean();
    } else {
      // Fetch only selected members
      members = await Member.find({ 
        _id: { $in: selectedMembers },
        email: { $exists: true, $ne: '' } 
      }).select('fullName email').lean();
    }

    if (members.length === 0) {
      return NextResponse.json({ error: 'No members found in database' }, { status: 404 });
    }

    console.log(`Found ${members.length} members to send emails to`);

    // Check email configuration
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    console.log('Email configuration status:', {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_USER: process.env.EMAIL_USER ? 'configured' : 'missing',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'configured' : 'missing',
      EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
      EMAIL_PORT: process.env.EMAIL_PORT || '587'
    });

    // Skip sending in development if no email credentials
    if (process.env.NODE_ENV !== 'production' && !emailConfigured) {
      console.log('Development mode: Skipping email sending due to missing email credentials');
      console.log('Subject:', subject);
      console.log('Template Type:', templateType);
      console.log('Message preview:', message.substring(0, 100) + '...');
      console.log('Sample recipients:', members.slice(0, 3).map(m => ({ name: m.fullName, email: m.email })));
      
      return NextResponse.json({ 
        message: 'Bulk reminder emails sent successfully (development mode - no email credentials)', 
        count: members.length,
        templateType,
        recipients: members.length,
        warning: 'Emails were not actually sent due to missing email configuration in development mode'
      });
    }

    // Verify email transporter configuration
    if (!emailConfigured) {
      console.error('Email configuration missing in production mode');
      return NextResponse.json({ 
        error: 'Email service not configured. Please contact administrator.' 
      }, { status: 500 });
    }

    // Test email transporter connection
    try {
      console.log('Testing email transporter connection...');
      await transporter.verify();
      console.log('Email transporter connection verified successfully');
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      return NextResponse.json({ 
        error: 'Email service connection failed. Please check email configuration.' 
      }, { status: 500 });
    }

    // Send emails to all members
    const emailPromises = members.map(async (member: { fullName: string; email: string }) => {
      const mailOptions = {
        from: `"AWS Cloud Club ISIMS" <${process.env.EMAIL_USER}>`,
        to: member.email,
        subject: subject,
        text: createReminderEmailText(message, member.fullName),
        html: createReminderEmailHTML(message, member.fullName, templateType, customButton),
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${member.email}:`, info.messageId);
        return { email: member.email, name: member.fullName, success: true };
      } catch (error) {
        console.error(`Failed to send reminder email to ${member.email}:`, error);
        return { 
          email: member.email, 
          name: member.fullName, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Process emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < emailPromises.length; i += batchSize) {
      const batch = emailPromises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      
      // Add a small delay between batches to be respectful to email service
      if (i + batchSize < emailPromises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount > 0) {
      console.log('Some reminder emails failed to send:', results.filter(r => !r.success));
    }

    const recipientDescription = recipientType === 'all' 
      ? 'all members' 
      : recipientType === 'multiple' 
      ? `${members.length} selected members`
      : 'selected member';

    return NextResponse.json({
      message: `Email reminder sent to ${recipientDescription}: ${successCount} sent, ${failureCount} failed`,
      successCount,
      failureCount,
      totalMembers: members.length,
      recipientType,
      templateType,
      results: results.slice(0, 10) // Return only first 10 results to avoid large response
    });

  } catch (error) {
    console.error('Error in bulk-email-reminder API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch member count for preview
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database and count members
    await connectToDatabase();
    const memberCount = await Member.countDocuments({ 
      email: { $exists: true, $ne: '' } 
    });

    return NextResponse.json({
      memberCount,
      message: `Found ${memberCount} members with valid email addresses`
    });

  } catch (error) {
    console.error('Error fetching member count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}