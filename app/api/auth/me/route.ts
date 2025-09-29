import { NextRequest, NextResponse } from 'next/server';
import { verifyMemberAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const member = await verifyMemberAuth(request);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member._id,
        email: member.email,
        fullName: member.fullName,
        organization: member.organization,
        lastLogin: member.lastLogin,
        paidDate: member.paidDate
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}