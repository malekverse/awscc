import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { verifyMemberAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { getPresignedDownloadUrl } from '@/lib/aws-s3';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Find the resource first
    const resource = await Resource.findById(params.id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if resource is active
    if (!resource.isActive) {
      return NextResponse.json({ error: 'Resource not available' }, { status: 403 });
    }

    // For private resources, require authentication
    if (!resource.isPublic) {
      const member = await verifyMemberAuth(request);
      if (!member) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Check if resource has expired
    if (resource.expiryDate && new Date(resource.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Resource has expired' }, { status: 403 });
    }

    // Only allow downloads for document type resources
    if (resource.type !== 'document' || !resource.fileUrl) {
      return NextResponse.json({ error: 'Resource is not downloadable' }, { status: 400 });
    }

    // Extract the S3 key from the fileUrl
    // Assuming fileUrl is in format: https://bucket.s3.region.amazonaws.com/key
    const urlParts = resource.fileUrl.split('/');
    const s3Key = urlParts.slice(3).join('/'); // Everything after the domain

    // Generate presigned URL for download
    const presignedResult = await getPresignedDownloadUrl(s3Key, 300); // 5 minutes expiry
    
    if (!presignedResult.success) {
      console.error('Error generating presigned URL:', presignedResult.error);
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Increment download count
    await Resource.findByIdAndUpdate(params.id, {
      $inc: { downloadCount: 1 }
    });

    // Return the presigned URL
    return NextResponse.json({
      success: true,
      downloadUrl: presignedResult.url,
      fileName: resource.fileName || resource.title,
      expiresIn: 300 // 5 minutes
    });

  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}