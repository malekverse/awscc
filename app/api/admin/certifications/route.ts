import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Certification, { MemberCertification } from '../../../../models/Certification';
import Member from '../../../../models/Member';
import { verifyAdminAuth } from '../../../../lib/auth';

// GET - Fetch all certifications with pagination and filtering
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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== null) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [certifications, total] = await Promise.all([
      Certification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Certification.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: certifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}

// POST - Create a new certification
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

    const body = await request.json();
    const {
      name,
      description,
      provider,
      category,
      difficulty,
      requirements,
      validityPeriod,
      certificateTemplate,
      badgeUrl,
      isActive = true,
      createdBy
    } = body;

    // Validate required fields
    if (!name || !description || !provider || !category || !difficulty || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if certification already exists
    const existingCertification = await Certification.findOne({ name, provider });
    if (existingCertification) {
      return NextResponse.json(
        { error: 'Certification with this name and provider already exists' },
        { status: 400 }
      );
    }

    // Create certification
    const certification = new Certification({
      name,
      description,
      provider,
      category,
      difficulty,
      requirements,
      validityPeriod,
      certificateTemplate,
      badgeUrl,
      isActive,
      createdBy
    });

    await certification.save();

    return NextResponse.json({
      success: true,
      data: certification
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating certification:', error);
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}