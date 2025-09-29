import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Event, { EventRegistration } from '@/models/Event';
import { verifyMemberAuth } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

// POST - Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify member authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const eventId = params.id;
    const memberId = member._id;

    // Check if event exists and is available for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'published' || !event.isPublic) {
      return NextResponse.json(
        { error: 'Event is not available for registration' },
        { status: 400 }
      );
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check if event has already started
    if (new Date() > event.startDate) {
      return NextResponse.json(
        { error: 'Event has already started' },
        { status: 400 }
      );
    }

    // Check if member is already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId: eventId,
      memberId: memberId,
      status: { $in: ['registered', 'attended'] }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Check if event is full
    if (event.maxAttendees) {
      const currentRegistrations = await EventRegistration.countDocuments({
        eventId: eventId,
        status: { $in: ['registered', 'attended'] }
      });

      if (currentRegistrations >= event.maxAttendees) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        );
      }
    }

    // Create registration
    const registration = new EventRegistration({
      eventId: eventId,
      memberId: memberId,
      status: 'registered',
      paymentStatus: event.price > 0 ? 'pending' : 'free',
      registrationDate: new Date()
    });

    await registration.save();

    // Update event's current attendees count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentAttendees: 1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        registrationId: registration._id,
        status: registration.status,
        paymentStatus: registration.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel event registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify member authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const eventId = params.id;
    const memberId = member._id;

    // Find the registration
    const registration = await EventRegistration.findOne({
      eventId: eventId,
      memberId: memberId,
      status: { $in: ['registered', 'attended'] }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if event has already started (can't cancel after event starts)
    const event = await Event.findById(eventId);
    if (event && new Date() > event.startDate) {
      return NextResponse.json(
        { error: 'Cannot cancel registration after event has started' },
        { status: 400 }
      );
    }

    // Update registration status to cancelled
    registration.status = 'cancelled';
    await registration.save();

    // Update event's current attendees count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentAttendees: -1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully cancelled event registration'
    });
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}