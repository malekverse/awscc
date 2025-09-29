import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Event, { EventRegistration } from '../../../../models/Event';
import { verifyAdminAuth } from '../../../../lib/auth';
import { uploadFileToS3, generateOrganizedFileKey, validateFile, fileToBuffer, FILE_CONFIGS } from '../../../../lib/aws-s3';

export const dynamic = 'force-dynamic';

// GET - Fetch all events with pagination and filtering
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');
    const isVirtual = searchParams.get('isVirtual');
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (isVirtual !== null) filter.isVirtual = isVirtual === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { speakerInfo: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: events,
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

// POST - Create a new event
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
    const status = formData.get('status') as 'draft' | 'published' | 'cancelled' | 'completed' || 'draft';
    const registrationRequired = formData.get('registrationRequired') === 'true';
    const certificateOffered = formData.get('certificateOffered') === 'true';
    const certificationId = formData.get('certificationId') as string;
    const createdBy = formData.get('createdBy') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!title || !description || !type || !startDate || !endDate || !category || !difficulty || !createdBy) {
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

    let imageUrl = '';

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

      // Upload to S3
      const fileBuffer = await fileToBuffer(imageFile);
      const fileKey = generateOrganizedFileKey('eventBanners', imageFile.name, createdBy);
      
      const uploadResult = await uploadFileToS3(fileBuffer, fileKey, imageFile.type, {
        title,
        category,
        uploadedBy: createdBy
      });

      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error },
          { status: 500 }
        );
      }

      imageUrl = uploadResult.url!;
    }

    // Create event
    const event = new Event({
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
      createdBy
    });

    await event.save();

    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}