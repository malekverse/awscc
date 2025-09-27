import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import Event, { EventRegistration } from '../../../../../models/Event';
import { verifyAdminAuth } from '../../../../../lib/auth';
import { uploadFileToS3, deleteFileFromS3, generateOrganizedFileKey, validateFile, fileToBuffer, cleanupOldFile } from '../../../../../lib/aws-s3';

// GET - Fetch a single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get registration count
    const registrationCount = await EventRegistration.countDocuments({ 
      eventId: params.id,
      status: { $in: ['confirmed', 'attended'] }
    });

    const eventWithStats = {
      ...event.toObject(),
      currentAttendees: registrationCount
    };

    return NextResponse.json({
      success: true,
      data: eventWithStats
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'workshop' | 'webinar' | 'conference' | 'meetup' | 'training' | 'other';
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const location = formData.get('location') as string;
    const virtualLink = formData.get('virtualLink') as string;
    const isVirtual = formData.get('isVirtual') === 'true';
    const maxAttendees = parseInt(formData.get('maxAttendees') as string || '0');
    const registrationDeadline = formData.get('registrationDeadline') as string;
    const price = parseFloat(formData.get('price') as string || '0');
    const currency = formData.get('currency') as string || 'USD';
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const difficulty = formData.get('difficulty') as 'beginner' | 'intermediate' | 'advanced';
    const prerequisites = JSON.parse(formData.get('prerequisites') as string || '[]');
    const agenda = formData.get('agenda') as string;
    const speakerInfo = formData.get('speakerInfo') as string;
    const materials = JSON.parse(formData.get('materials') as string || '[]');
    const isPublic = formData.get('isPublic') === 'true';
    const status = formData.get('status') as 'draft' | 'published' | 'cancelled' | 'completed';
    const registrationRequired = formData.get('registrationRequired') === 'true';
    const certificateOffered = formData.get('certificateOffered') === 'true';
    const certificationId = formData.get('certificationId') as string;
    const lastModifiedBy = formData.get('lastModifiedBy') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!title || !description || !type || !startDate || !endDate || !category || !difficulty || !lastModifiedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    let imageUrl = event.imageUrl;

    // Handle image upload
    if (imageFile) {
      // Validate image file
      const validation = validateFile(imageFile, ['image/jpeg', 'image/png', 'image/webp']);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Delete old image if it exists
      if (event.imageUrl) {
        const oldFileKey = event.imageUrl.split('/').pop();
        if (oldFileKey) {
          await deleteFileFromS3(`events/images/${oldFileKey}`);
        }
      }

      // Upload new image to S3
      const fileBuffer = await fileToBuffer(imageFile);
      const fileKey = generateOrganizedFileKey('eventBanners', imageFile.name, lastModifiedBy);
      
      const uploadResult = await uploadFileToS3(fileBuffer, fileKey, imageFile.type, {
        title,
        category,
        uploadedBy: lastModifiedBy
      });

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error },
          { status: 500 }
        );
      }

      imageUrl = uploadResult.url!;
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        type,
        startDate: start,
        endDate: end,
        location: isVirtual ? undefined : location,
        virtualLink: isVirtual ? virtualLink : undefined,
        isVirtual,
        maxAttendees: maxAttendees > 0 ? maxAttendees : undefined,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        price,
        currency,
        category,
        tags,
        difficulty,
        prerequisites,
        agenda,
        speakerInfo,
        materials,
        imageUrl,
        isPublic,
        status,
        registrationRequired,
        certificateOffered,
        certificationId: certificationId || undefined,
        lastModifiedBy
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event has registrations
    const registrationCount = await EventRegistration.countDocuments({ 
      eventId: params.id 
    });

    if (registrationCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete event. It has ${registrationCount} registration(s)` },
        { status: 400 }
      );
    }

    // Delete image from S3 if it exists
    if (event.imageUrl) {
      const fileKey = event.imageUrl.split('/').pop();
      if (fileKey) {
        await deleteFileFromS3(`events/images/${fileKey}`);
      }
    }

    // Delete event from database
    await Event.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}