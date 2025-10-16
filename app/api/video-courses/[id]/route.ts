import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VideoCourse from '@/models/VideoCourse';
import { verifyAdminAuth, verifyMemberAuth, logAdminAction, getClientIP } from '@/lib/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// GET - Fetch single video course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Check if request is from admin or member
    const admin = await verifyAdminAuth(request);
    const member = !admin ? await verifyMemberAuth(request) : null;

    if (!admin && !member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid video course ID' }, { status: 400 });
    }

    // Build filter based on user type
    const filter: any = { _id: params.id };
    
    // For members, only show public and active courses
    if (member) {
      filter.isPublic = true;
      filter.isActive = true;
    }

    const videoCourse = await VideoCourse.findOne(filter);

    if (!videoCourse) {
      return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
    }

    // Increment view count for members (not for admins to avoid inflating stats)
    if (member) {
      await VideoCourse.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });
    }

    return NextResponse.json({
      success: true,
      data: videoCourse
    });

  } catch (error) {
    console.error('Error fetching video course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video course' },
      { status: 500 }
    );
  }
}

// PUT - Update video course (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid video course ID' }, { status: 400 });
    }

    // Check if video course exists
    const existingCourse = await VideoCourse.findById(params.id);
    if (!existingCourse) {
      return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const {
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
      publishDate,
      metaDescription,
      sortOrder
    } = body;

    // Validate video type if provided
    if (videoType) {
      const validVideoTypes = ['youtube', 'vimeo', 'direct_upload', 'embed_link'];
      if (!validVideoTypes.includes(videoType)) {
        return NextResponse.json(
          { error: 'Invalid video type. Must be one of: ' + validVideoTypes.join(', ') },
          { status: 400 }
        );
      }
    }

    // Validate difficulty if provided
    if (difficulty) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(difficulty)) {
        return NextResponse.json(
          { error: 'Invalid difficulty. Must be one of: ' + validDifficulties.join(', ') },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      lastModifiedBy: admin._id.toString()
    };

    // Only update provided fields
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (videoType !== undefined) updateData.videoType = videoType;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (embedCode !== undefined) updateData.embedCode = embedCode;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) updateData.duration = duration;
    if (videoQuality !== undefined) updateData.videoQuality = videoQuality;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (instructor !== undefined) updateData.instructor = instructor;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (learningObjectives !== undefined) updateData.learningObjectives = learningObjectives;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (publishDate !== undefined) updateData.publishDate = new Date(publishDate);
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Update video course
    const updatedCourse = await VideoCourse.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log admin action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'UPDATE_VIDEO_COURSE',
      targetType: 'system',
      targetId: params.id,
      details: { 
        title: updatedCourse?.title,
        changes: Object.keys(updateData).filter(key => key !== 'lastModifiedBy')
      },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Video course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Error updating video course:', error);
    return NextResponse.json(
      { error: 'Failed to update video course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video course (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid video course ID' }, { status: 400 });
    }

    // Check if video course exists
    const existingCourse = await VideoCourse.findById(params.id);
    if (!existingCourse) {
      return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
    }

    // Delete the video course
    await VideoCourse.findByIdAndDelete(params.id);

    // Log admin action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'DELETE_VIDEO_COURSE',
      targetType: 'system',
      targetId: params.id,
      details: { 
        title: existingCourse.title,
        category: existingCourse.category,
        videoType: existingCourse.videoType
      },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Video course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video course:', error);
    return NextResponse.json(
      { error: 'Failed to delete video course' },
      { status: 500 }
    );
  }
}