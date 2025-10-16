import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyMemberAuth, hashPassword, comparePassword } from '@/lib/auth';
import Member from '@/models/Member';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Verify authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match.' },
        { status: 400 }
      );
    }

    // Basic validation - just ensure password is not empty
    if (newPassword.trim().length === 0) {
      return NextResponse.json(
        { error: 'New password cannot be empty.' },
        { status: 400 }
      );
    }

    // Find the member in database
    const memberDoc = await Member.findById(member._id);
    if (!memberDoc) {
      return NextResponse.json(
        { error: 'Member not found.' },
        { status: 404 }
      );
    }

    // Verify current password
    if (!memberDoc.password) {
      return NextResponse.json(
        { error: 'No password set. Please use forgot password to set a new password.' },
        { status: 400 }
      );
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, memberDoc.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await comparePassword(newPassword, memberDoc.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password in database
    await Member.findByIdAndUpdate(member._id, {
      password: hashedNewPassword,
      temporaryPassword: undefined, // Clear temporary password if exists
      passwordResetToken: undefined, // Clear any reset tokens
      passwordResetExpires: undefined
    });

    // Log the password change (optional - for security audit)
    console.log(`Password changed for member: ${member.email} at ${new Date().toISOString()}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Password changed successfully.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}