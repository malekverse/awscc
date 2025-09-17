import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminAuth, logAdminAction, getClientIP, generateRandomPassword, hashPassword } from '@/lib/auth';
import { sendMemberWelcomeEmail } from '@/lib/email-service';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { id } = params;
    const updates = await request.json();
    
    // Find the member
    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    const oldPaidStatus = member.paid;
    const newPaidStatus = updates.paid;
    
    // Update member fields
    Object.keys(updates).forEach(key => {
      if (key in member.schema.paths) {
        member[key] = updates[key];
      }
    });
    
    // If marking as paid for the first time
    if (!oldPaidStatus && newPaidStatus) {
      member.paidDate = new Date();
      member.paidBy = admin.email;
      
      // Generate temporary password if not exists
      if (!member.password && !member.temporaryPassword) {
        const tempPassword = generateRandomPassword();
        member.temporaryPassword = tempPassword;
        member.password = await hashPassword(tempPassword);
      }
      
      // Send welcome email with login credentials
      try {
        await sendMemberWelcomeEmail({
          to: member.email,
          memberName: member.fullName,
          email: member.email,
          temporaryPassword: member.temporaryPassword || 'Please contact admin',
          dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`
        });
        
        member.emailSent = true;
        
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue with the update even if email fails
      }
    }
    
    // If marking as unpaid
    if (oldPaidStatus && !newPaidStatus) {
      member.paidDate = undefined;
      member.paidBy = undefined;
    }
    
    await member.save();
    
    // Log the action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'member_payment_status_changed',
      targetType: 'member',
      targetId: member._id.toString(),
      targetEmail: member.email,
      details: {
        oldStatus: oldPaidStatus,
        newStatus: newPaidStatus,
        updates,
        emailSent: member.emailSent
      },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });
    
    // Return updated member (without sensitive data)
    const updatedMember = await Member.findById(id)
      .select('-password -temporaryPassword -passwordResetToken')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: newPaidStatus && !oldPaidStatus ? 'Member marked as paid and welcome email sent' : 'Member updated successfully'
    });
    
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only super_admin can delete members
    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const { id } = params;
    
    // Find and delete the member
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Log the action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'member_deleted',
      targetType: 'member',
      targetId: member._id.toString(),
      targetEmail: member.email,
      details: {
        deletedMember: {
          fullName: member.fullName,
          email: member.email,
          submissionDate: member.submissionDate
        }
      },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });
    
    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}