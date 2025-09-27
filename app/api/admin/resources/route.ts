import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Resource from '../../../../models/Resource';
import { uploadFileToS3, deleteFileFromS3, generateOrganizedFileKey, validateFile, fileToBuffer, FILE_CONFIGS, getFileConfigByType } from '../../../../lib/aws-s3';

// GET - Fetch all resources with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    // Build filter object
    const filter: any = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== null) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST - Create a new resource
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'link' | 'document' | 'video_course';
    const url = formData.get('url') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const difficulty = formData.get('difficulty') as 'beginner' | 'intermediate' | 'advanced';
    const isPublic = formData.get('isPublic') === 'true';
    const createdBy = formData.get('createdBy') as string;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!title || !description || !type || !category || !difficulty || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Handle file upload for documents
    if (type === 'document' && file) {
      // Validate file type only (no size limit)
      // Determine the appropriate file config based on file type
      const fileConfigKey = getFileConfigByType(file.type, 'resource');
      if (!fileConfigKey) {
        return NextResponse.json(
          { error: 'File type not supported for resources' },
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

      // Upload to S3
      const fileBuffer = await fileToBuffer(file);
      const fileKey = generateOrganizedFileKey(fileConfigKey, file.name, createdBy, category);
      
      const uploadResult = await uploadFileToS3(fileBuffer, fileKey, file.type, {
        title,
        category,
        uploadedBy: createdBy
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

    // Create resource
    const resource = new Resource({
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
      createdBy
    });

    await resource.save();

    return NextResponse.json({
      success: true,
      data: resource
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}