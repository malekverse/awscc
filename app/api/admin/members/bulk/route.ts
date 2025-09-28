import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminAuth, generateRandomPassword, hashPassword } from '@/lib/auth';
import { sendMemberWelcomeEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
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
    
    const { memberIds, action } = await request.json();
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
        { status: 400 }
      );
    }
    
    if (!['paid', 'unpaid', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'paid':
        // First, get the members that are being marked as paid
        const membersToUpdate = await Member.find({ 
          _id: { $in: memberIds },
          paid: { $ne: true } // Only get members who are not already paid
        });
        
        // Update members to paid status and generate passwords for those without one
        const updatePromises = membersToUpdate.map(async (member) => {
          let updateData: any = { paid: true };
          let tempPassword = null;
          
          // Generate password if member doesn't have one
          if (!member.password) {
            tempPassword = generateRandomPassword(12);
            updateData.password = await hashPassword(tempPassword);
          }
          
          // Update the member
          await Member.findByIdAndUpdate(member._id, updateData);
          
          // Send welcome email with credentials
          try {
            await sendMemberWelcomeEmail({
              to: member.email,
              memberName: member.fullName || member.email,
              email: member.email,
              temporaryPassword: tempPassword || 'Use your existing password',
              dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/member/dashboard`
            });
            console.log(`Welcome email sent to ${member.email}`);
          } catch (emailError) {
            console.error(`Failed to send welcome email to ${member.email}:`, emailError);
            // Don't fail the entire operation if email fails
          }
          
          return member;
        });
        
        await Promise.all(updatePromises);
        
        result = {
          modifiedCount: membersToUpdate.length,
          acknowledged: true
        };
        break;
        
      case 'unpaid':
        result = await Member.updateMany(
          { _id: { $in: memberIds } },
          { $set: { paid: false } }
        );
        break;
        
      case 'delete':
        result = await Member.deleteMany(
          { _id: { $in: memberIds } }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    let message = `Successfully ${action === 'delete' ? 'deleted' : 'updated'} ${result.modifiedCount || result.deletedCount} member(s)`;
    
    if (action === 'paid' && result.modifiedCount > 0) {
      message += `. Welcome emails with login credentials have been sent to newly paid members.`;
    }
    
    return NextResponse.json({
      success: true,
      message,
      affectedCount: result.modifiedCount || result.deletedCount
    });
    
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}