import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VideoCourse from '@/models/VideoCourse';
import { verifyAdminAuth, verifyMemberAuth, logAdminAction, getClientIP } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch video courses (for members and admins)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Check if request is from admin or member
    const admin = await verifyAdminAuth(request);
    const member = !admin ? await verifyMemberAuth(request) : null;

    if (!admin && !member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const videoType = searchParams.get('videoType');

    // Build filter query
    const filter: any = {};

    // For members, only show public and active courses
    if (member) {
      filter.isPublic = true;
      filter.isActive = true;
    }

    // Apply filters
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (featured === 'true') filter.isFeatured = true;
    if (videoType) filter.videoType = videoType;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch courses with pagination
    const courses = await VideoCourse.find(filter)
      .sort({ isFeatured: -1, sortOrder: 1, publishDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await VideoCourse.countDocuments(filter);

    // Get unique categories and other filter options
    const categories = await VideoCourse.distinct('category', member ? { isPublic: true, isActive: true } : {});
    const videoTypes = await VideoCourse.distinct('videoType', member ? { isPublic: true, isActive: true } : {});

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        videoTypes,
        difficulties: ['beginner', 'intermediate', 'advanced']
      }
    });

  } catch (error) {
    console.error('Error fetching video courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video courses' },
      { status: 500 }
    );
  }
}

// POST - Create new video course (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      tags = [],
      difficulty,
      videoType,
      videoUrl,
      embedCode,
      thumbnailUrl,
      duration,
      videoQuality,
      fileSize,
      instructor,
      prerequisites = [],
      learningObjectives = [],
      isPublic = true,
      isActive = true,
      isFeatured = false,
      publishDate,
      metaDescription,
      sortOrder = 0
    } = body;

    // Validate required fields
    if (!title || !description || !category || !difficulty || !videoType || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, difficulty, videoType, videoUrl' },
        { status: 400 }
      );
    }

    // Validate video type
    const validVideoTypes = ['youtube', 'vimeo', 'direct_upload', 'embed_link'];
    if (!validVideoTypes.includes(videoType)) {
      return NextResponse.json(
        { error: 'Invalid video type. Must be one of: ' + validVideoTypes.join(', ') },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be one of: ' + validDifficulties.join(', ') },
        { status: 400 }
      );
    }

    // Create new video course
    const videoCourse = new VideoCourse({
      title,
      description,
      category,
      tags,
      difficulty,
      videoType,
      videoUrl,
      embedCode,
      thumbnailUrl,
      duration,
      videoQuality,
      fileSize,
      instructor,
      prerequisites,
      learningObjectives,
      isPublic,
      isActive,
      isFeatured,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      createdBy: admin._id.toString(),
      metaDescription,
      sortOrder
    });

    await videoCourse.save();

    // Log admin action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'CREATE_VIDEO_COURSE',
      targetType: 'system',
      targetId: videoCourse._id.toString(),
      details: { title, category, videoType },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Video course created successfully',
      data: videoCourse
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating video course:', error);
    return NextResponse.json(
      { error: 'Failed to create video course' },
      { status: 500 }
    );
  }
}