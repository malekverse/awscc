import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { verifyMemberAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Find the resource
    const resource = await Resource.findById(params.id)
      .select('-createdBy -lastModifiedBy -__v')
      .lean();

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if resource is accessible
    if (!resource.isPublic || !resource.isActive) {
      return NextResponse.json({ error: 'Resource not available' }, { status: 403 });
    }

    // Check if resource has expired
    if (resource.expiryDate && new Date(resource.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Resource has expired' }, { status: 403 });
    }

    // Increment view count
    await Resource.findByIdAndUpdate(params.id, {
      $inc: { viewCount: 1 }
    });

    return NextResponse.json({ resource });

  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const member = await verifyMemberAuth(request);
    if (!member) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Find the resource
    const resource = await Resource.findById(params.id);

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if resource is accessible
    if (!resource.isPublic || !resource.isActive) {
      return NextResponse.json({ error: 'Resource not available' }, { status: 403 });
    }

    // Check if resource has expired
    if (resource.expiryDate && new Date(resource.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Resource has expired' }, { status: 403 });
    }

    // Increment download count (for document type resources)
    if (resource.type === 'document') {
      await Resource.findByIdAndUpdate(params.id, {
        $inc: { downloadCount: 1 }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}