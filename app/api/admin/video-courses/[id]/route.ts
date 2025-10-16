import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VideoCourse from '@/models/VideoCourse';
import { verifyAdminAuth, logAdminAction, getClientIP } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export const dynamic = 'force-dynamic';

// GET - Fetch single video course (admin)
export async function GET(
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

    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid video course ID' }, { status: 400 });
    }

    // Find video course
    const videoCourse = await VideoCourse.findById(id).lean();

    if (!videoCourse) {
      return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
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

    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid video course ID' }, { status: 400 });
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

    // Find existing video course
    const existingCourse = await VideoCourse.findById(id);
    if (!existingCourse) {
      return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
    }

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

    // Update video course
    const updateData: any = {
      updatedAt: new Date(),
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

    const updatedCourse = await VideoCourse.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log admin action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'UPDATE_VIDEO_COURSE',
      targetType: 'video_course',
      targetId: id,
      details: { title: updatedCourse?.title, changes: Object.keys(updateData) },
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

    const { id } = params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid video course ID' }, { status: 400 });
    }

    // Find and delete video course
    const deletedCourse = await VideoCourse.findByIdAndDelete(id);

    if (!deletedCourse) {
      return NextResponse.json({ error: 'Video course not found' }, { status: 404 });
    }

    // Log admin action
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: 'DELETE_VIDEO_COURSE',
      targetType: 'video_course',
      targetId: id,
      details: { title: deletedCourse.title, category: deletedCourse.category },
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