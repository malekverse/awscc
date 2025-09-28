import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find member by email
    const member = await Member.findOne({ email: email.toLowerCase() });
    if (!member) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Check if member is active and paid
    if (!member.isActive || !member.paid) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Save reset token to member
    member.passwordResetToken = resetToken;
    member.passwordResetExpires = resetTokenExpiry;
    await member.save();
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(member.email, resetToken);
      console.log(`Password reset email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue with success response even if email fails to avoid revealing email existence
    }
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}