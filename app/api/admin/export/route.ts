import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    // Get all members
    const members = await Member.find({})
      .select('-password -temporaryPassword -passwordResetToken')
      .lean();
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Full Name',
        'Email',
        'Organization',
        'Phone',
        'Year of Study',
        'Field of Study',
        'Payment Status',
        'Email Sent',
        'Submission Date'
      ];
      
      const csvRows = [headers.join(',')];
      
      members.forEach(member => {
        const row = [
          `"${member.fullName || ''}"`,
          `"${member.email || ''}"`,
          `"${member.organization || ''}"`,
          `"${member.phone || ''}"`,
          `"${member.yearOfStudy || ''}"`,
          `"${member.fieldOfStudy || ''}"`,
          member.paid ? 'Paid' : 'Unpaid',
          member.emailSent ? 'Yes' : 'No',
          new Date(member.submissionDate).toLocaleDateString()
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="members.csv"'
        }
      });
    }
    
    // For other formats, return JSON for now
    return NextResponse.json({
      success: true,
      data: members,
      message: 'Excel export not implemented yet'
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}