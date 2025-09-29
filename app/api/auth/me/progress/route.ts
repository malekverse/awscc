import { NextRequest, NextResponse } from 'next/server';
import { verifyMemberAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { MemberCertification } from '@/models/Certification';
import Event from '@/models/Event';
import Resource from '@/models/Resource';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify member authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Get member's certifications count
    const certificatesEarned = await MemberCertification.countDocuments({
      memberId: member._id,
      status: 'active'
    });

    // Get member's event registrations
    const memberEvents = await Event.find({
      'registrations.memberId': member._id
    }).lean();

    const eventsAttended = memberEvents.filter(event => {
      const registration = event.registrations?.find(
        (reg: any) => reg.memberId.toString() === member._id.toString()
      );
      return registration?.status === 'attended';
    }).length;

    const totalEvents = memberEvents.length;

    // Get total available resources for progress calculation
    const totalResources = await Resource.countDocuments({
      isActive: true,
      isPublic: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    });

    // Calculate progress metrics
    // Note: For courses and workshops, we'll use placeholder logic since
    // the current system doesn't track individual course/workshop completion
    const progressData = {
      certificatesEarned,
      eventsAttended,
      totalEvents,
      // Placeholder values - these would need proper tracking implementation
      completedCourses: Math.floor(certificatesEarned * 1.5), // Estimate based on certifications
      totalCourses: Math.max(15, Math.floor(certificatesEarned * 2)), // Dynamic total
      completedWorkshops: eventsAttended,
      totalWorkshops: Math.max(6, totalEvents),
      // Resource interaction metrics
      totalResources,
      resourcesAccessed: Math.floor(totalResources * 0.3), // Placeholder - would need tracking
      // Learning streak and engagement metrics
      learningStreak: 0, // Would need daily activity tracking
      lastActivityDate: member.lastLogin || member.createdAt,
      memberSince: member.createdAt,
      // Achievement metrics
      totalPoints: certificatesEarned * 100 + eventsAttended * 50, // Point system
      currentLevel: Math.floor((certificatesEarned * 100 + eventsAttended * 50) / 500) + 1,
      nextLevelPoints: ((Math.floor((certificatesEarned * 100 + eventsAttended * 50) / 500) + 1) * 500) - (certificatesEarned * 100 + eventsAttended * 50)
    };

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error fetching member progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}