import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { verifyMemberAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    // Build filter query
    const filter: any = {
      isPublic: true,
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$and = [
        filter.$and || {},
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch resources with pagination
    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .select('-createdBy -lastModifiedBy -__v')
        .sort({ publishDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(filter)
    ]);



    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: resources,
      pagination: {
        page: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        types: ['document', 'video', 'link', 'tool'],
        categories: ['aws-basics', 'certification', 'hands-on', 'best-practices', 'architecture'],
        difficulties: ['beginner', 'intermediate', 'advanced']
      }
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}