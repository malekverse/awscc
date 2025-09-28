import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Find member by reset token and check if token is not expired
    const member = await Member.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Check if member is active and paid
    if (!member.isActive || !member.paid) {
      return NextResponse.json(
        { error: 'Account is not eligible for password reset' },
        { status: 403 }
      );
    }
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update member's password and clear reset token
    member.password = hashedPassword;
    member.passwordResetToken = undefined;
    member.passwordResetExpires = undefined;
    member.temporaryPassword = undefined; // Clear any temporary password
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}