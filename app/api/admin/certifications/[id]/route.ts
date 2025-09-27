import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import Certification, { MemberCertification } from '../../../../../models/Certification';
import { verifyAdminAuth } from '../../../../../lib/auth';

// GET - Fetch a single certification by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const certification = await Certification.findById(params.id);
    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: certification
    });
  } catch (error) {
    console.error('Error fetching certification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
      { status: 500 }
    );
  }
}

// PUT - Update a certification
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const certification = await Certification.findById(params.id);
    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

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
      isActive,
      lastModifiedBy
    } = body;

    // Validate required fields
    if (!name || !description || !provider || !category || !difficulty || !lastModifiedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if name/provider combination is already taken by another certification
    if (name !== certification.name || provider !== certification.provider) {
      const existingCertification = await Certification.findOne({ 
        name, 
        provider,
        _id: { $ne: params.id }
      });
      if (existingCertification) {
        return NextResponse.json(
          { error: 'Certification with this name and provider already exists' },
          { status: 400 }
        );
      }
    }

    // Update certification
    const updatedCertification = await Certification.findByIdAndUpdate(
      params.id,
      {
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
        lastModifiedBy
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedCertification
    });
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json(
      { error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a certification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const certification = await Certification.findById(params.id);
    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Check if certification is assigned to any members
    const assignedCount = await MemberCertification.countDocuments({ 
      certificationId: params.id 
    });

    if (assignedCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete certification. It is assigned to ${assignedCount} member(s)` },
        { status: 400 }
      );
    }

    // Delete certification from database
    await Certification.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    );
  }
}