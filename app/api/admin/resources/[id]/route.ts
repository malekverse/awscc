import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import Resource from '../../../../../models/Resource';
import { uploadFileToS3, deleteFileFromS3, generateOrganizedFileKey, validateFile, fileToBuffer, FILE_CONFIGS, getFileConfigByType, cleanupOldFile } from '../../../../../lib/aws-s3';

// GET - Fetch a single resource by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const resource = await Resource.findById(params.id);
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PUT - Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const resource = await Resource.findById(params.id);
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'link' | 'document' | 'video_course';
    const url = formData.get('url') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const difficulty = formData.get('difficulty') as 'beginner' | 'intermediate' | 'advanced';
    const isPublic = formData.get('isPublic') === 'true';
    const lastModifiedBy = formData.get('lastModifiedBy') as string;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!title || !description || !type || !category || !difficulty || !lastModifiedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let fileUrl = resource.fileUrl;
    let fileName = resource.fileName;
    let fileSize = resource.fileSize;

    // Handle file upload for documents
    if (type === 'document' && file) {
      // Determine the appropriate file config based on file type
      const fileConfigKey = getFileConfigByType(file.type, 'resource');
      if (!fileConfigKey) {
        return NextResponse.json(
          { success: false, error: 'File type not supported for resources' },
          { status: 400 }
        );
      }
      
      const fileConfig = FILE_CONFIGS[fileConfigKey];
      const validation = validateFile(file, fileConfig.allowedTypes);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // Clean up old file from S3 if it exists
      await cleanupOldFile(resource.fileUrl);

      // Upload new file to S3
      const fileBuffer = await fileToBuffer(file);
      const fileKey = generateOrganizedFileKey(fileConfigKey, file.name, lastModifiedBy, category);
      
      const uploadResult = await uploadFileToS3(fileBuffer, fileKey, file.type, {
        title,
        category,
        uploadedBy: lastModifiedBy
      });

      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error },
          { status: 500 }
        );
      }

      fileUrl = uploadResult.url!;
      fileName = file.name;
      fileSize = file.size;
    } else if ((type === 'link' || type === 'video_course') && !url) {
      return NextResponse.json(
        { success: false, error: 'URL is required for links and video courses' },
        { status: 400 }
      );
    }

    // If type changed from document to link/video_course, delete the old file
    if (resource.type === 'document' && type !== 'document' && resource.fileUrl) {
      // Clean up old file from S3 if it exists
      await cleanupOldFile(resource.fileUrl);
      fileUrl = '';
      fileName = '';
      fileSize = 0;
    }

    // Update resource
    const updatedResource = await Resource.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        type,
        url: type !== 'document' ? url : undefined,
        fileUrl: type === 'document' ? fileUrl : undefined,
        fileName: type === 'document' ? fileName : undefined,
        fileSize: type === 'document' ? fileSize : undefined,
        category,
        tags,
        difficulty,
        isPublic,
        lastModifiedBy
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const resource = await Resource.findById(params.id);
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Clean up file from S3 if it exists
    if (resource.type === 'document' && resource.fileUrl) {
      await cleanupOldFile(resource.fileUrl);
    }

    // Delete resource from database
    await Resource.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}