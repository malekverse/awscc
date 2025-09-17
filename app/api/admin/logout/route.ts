import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, logAdminAction, getClientIP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    
    if (admin) {
      // Log the logout action
      await logAdminAction({
        adminId: admin._id.toString(),
        adminEmail: admin.email,
        action: 'logout',
        targetType: 'admin',
        targetId: admin._id.toString(),
        targetEmail: admin.email,
        details: { logoutTime: new Date() },
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      });
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear the admin token cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}