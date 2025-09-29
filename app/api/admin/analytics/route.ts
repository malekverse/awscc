import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    
    // Get all members for analytics
    const members = await Member.find({})
      .select('submissionDate paid organization emailSent')
      .lean();
    
    // Calculate payment status distribution
    const paidCount = members.filter(m => m.paid).length;
    const unpaidCount = members.length - paidCount;
    
    const paymentStatus = [
      { name: 'Paid', value: paidCount, color: '#10B981' },
      { name: 'Unpaid', value: unpaidCount, color: '#EF4444' }
    ];
    
    // Calculate registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const registrationTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = members.filter(m => {
        const memberDate = new Date(m.submissionDate);
        return memberDate.toISOString().split('T')[0] === dateStr;
      }).length;
      
      registrationTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    
    // Calculate organization stats (top 10)
    const orgCounts: { [key: string]: number } = {};
    members.forEach(m => {
      const org = m.organization || 'No Organization';
      orgCounts[org] = (orgCounts[org] || 0) + 1;
    });
    
    const organizationStats = Object.entries(orgCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    // Calculate monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthMembers = members.filter(m => {
        const memberDate = new Date(m.submissionDate);
        return memberDate.getMonth() === date.getMonth() && 
               memberDate.getFullYear() === date.getFullYear();
      });
      
      monthlyStats.push({
        month: monthStr,
        registered: monthMembers.length,
        paid: monthMembers.filter(m => m.paid).length
      });
    }
    
    const analyticsData = {
      registrationTrend,
      paymentStatus,
      organizationStats,
      monthlyStats
    };
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}