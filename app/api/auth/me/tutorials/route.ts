import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { verifyMemberAuth } from '@/lib/auth';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'tutorials', 'videos', 'all'
    const limit = parseInt(searchParams.get('limit') || '20');
    const difficulty = searchParams.get('difficulty');

    // Build filter for resources
    const filter: any = {
      isActive: true,
      isPublic: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    // Filter by type if specified
    if (type === 'tutorials') {
      filter.type = { $in: ['link', 'document'] };
    } else if (type === 'videos') {
      filter.type = 'video_course';
    }

    // Filter by difficulty if specified
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Fetch resources
    const resources = await Resource.find(filter)
      .select('title description type url fileUrl fileName category tags difficulty viewCount downloadCount publishDate createdAt')
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform data for frontend
    const transformedResources = resources.map(resource => {
      const baseData = {
        id: resource._id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        difficulty: resource.difficulty,
        viewCount: resource.viewCount || 0,
        downloadCount: resource.downloadCount || 0,
        publishDate: resource.publishDate || resource.createdAt,
        tags: resource.tags || []
      };

      if (resource.type === 'video_course') {
        return {
          ...baseData,
          duration: '45 min', // Placeholder - would need to be stored in resource
          thumbnailUrl: '/placeholder.jpg', // Placeholder - would need thumbnail field
          videoUrl: resource.url || resource.fileUrl,
          type: 'video'
        };
      } else {
        return {
          ...baseData,
          duration: '30 min', // Placeholder - would need to be stored in resource
          url: resource.url || `/api/resources/${resource._id}/download`,
          type: 'tutorial'
        };
      }
    });

    // Separate tutorials and videos for different response formats
    const tutorials = transformedResources.filter(r => r.type === 'tutorial');
    const videos = transformedResources.filter(r => r.type === 'video');

    let responseData;
    if (type === 'tutorials') {
      responseData = tutorials;
    } else if (type === 'videos') {
      responseData = videos;
    } else {
      responseData = {
        tutorials,
        videos,
        all: transformedResources
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      total: transformedResources.length
    });

  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}