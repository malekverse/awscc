import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Event, { EventRegistration } from '../../../models/Event';
import { verifyMemberAuth } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch published events for members
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';

    // Build filter for published, public events
    const filter: any = {
      status: 'published',
      isPublic: true
    };

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (upcoming) {
      filter.startDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;
    
    // Sort by start date (upcoming events first)
    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .select('-createdBy -lastModifiedBy -__v')
      .lean();

    // Check if user is authenticated to get registration status
    let memberId = null;
    try {
      const member = await verifyMemberAuth(request);
      memberId = member?._id;
    } catch {
      // User not authenticated, continue without registration status
    }

    // Get registration status for authenticated user
    const eventsWithRegistration = await Promise.all(
      events.map(async (event) => {
        let isRegistered = false;
        let registrationStatus = null;
        
        if (memberId) {
          const registration = await EventRegistration.findOne({
            eventId: event._id,
            memberId: memberId,
            status: { $in: ['registered', 'attended'] }
          });
          
          if (registration) {
            isRegistered = true;
            registrationStatus = registration.status;
          }
        }

        // Calculate available spots
        const registrationCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: { $in: ['registered', 'attended'] }
        });

        const availableSpots = event.maxAttendees ? event.maxAttendees - registrationCount : null;
        const totalSpots = event.maxAttendees || null;

        // Determine event status
        const now = new Date();
        const eventDate = new Date(event.startDate);
        const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
        
        let eventStatus = 'available';
        if (eventDate < now) {
          eventStatus = 'completed';
        } else if (registrationDeadline && registrationDeadline < now) {
          eventStatus = 'registration_closed';
        } else if (availableSpots !== null && availableSpots <= 0) {
          eventStatus = 'full';
        }

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          date: event.startDate.toISOString().split('T')[0],
          time: event.startDate.toTimeString().slice(0, 5),
          location: event.isVirtual ? 'Virtual Event' : (event.location || 'TBA'),
          type: event.type,
          capacity: totalSpots,
          registeredCount: registrationCount,
          availableSpots: availableSpots,
          totalSpots: totalSpots,
          isRegistered: isRegistered,
          registrationStatus: registrationStatus,
          status: eventStatus,
          instructor: event.speakerInfo,
          prerequisites: event.prerequisites,
          difficulty: event.difficulty,
          price: event.price,
          currency: event.currency,
          imageUrl: event.imageUrl,
          isVirtual: event.isVirtual,
          virtualLink: event.virtualLink,
          registrationDeadline: event.registrationDeadline,
          certificateOffered: event.certificateOffered,
          agenda: event.agenda,
          materials: event.materials,
          tags: event.tags
        };
      })
    );

    const total = await Event.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: eventsWithRegistration,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}