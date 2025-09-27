import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Certification, { MemberCertification } from '../../../../models/Certification';
import Member from '../../../../models/Member';
import { verifyAdminAuth } from '../../../../lib/auth';

// GET - Fetch member certifications with pagination and filtering
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const memberId = searchParams.get('memberId');
    const certificationId = searchParams.get('certificationId');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'issuedDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};
    if (memberId) filter.memberId = memberId;
    if (certificationId) filter.certificationId = certificationId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [memberCertifications, total] = await Promise.all([
      MemberCertification.find(filter)
        .populate('memberId', 'fullName email')
        .populate('certificationId', 'name provider category difficulty')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      MemberCertification.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: memberCertifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching member certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member certifications' },
      { status: 500 }
    );
  }
}

// POST - Issue a certification to a member
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      memberId,
      certificationId,
      score,
      completionDate,
      expiryDate,
      notes,
      issuedBy
    } = body;

    // Validate required fields
    if (!memberId || !certificationId || !issuedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if certification exists
    const certification = await Certification.findById(certificationId);
    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Check if member already has this certification
    const existingCertification = await MemberCertification.findOne({
      memberId,
      certificationId,
      status: { $in: ['active', 'pending'] }
    });

    if (existingCertification) {
      return NextResponse.json(
        { error: 'Member already has this certification' },
        { status: 400 }
      );
    }

    // Generate certificate number
    const certificateNumber = `AWSCC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate expiry date if not provided
    let calculatedExpiryDate = expiryDate;
    if (!calculatedExpiryDate && certification.validityPeriod) {
      const issueDate = new Date();
      calculatedExpiryDate = new Date(issueDate.getTime() + (certification.validityPeriod * 24 * 60 * 60 * 1000));
    }

    // Create member certification
    const memberCertification = new MemberCertification({
      memberId,
      certificationId,
      certificateNumber,
      issuedDate: new Date(),
      expiryDate: calculatedExpiryDate,
      status: 'active',
      score,
      completionDate: completionDate || new Date(),
      notes,
      issuedBy
    });

    await memberCertification.save();

    // Populate the response
    const populatedCertification = await MemberCertification.findById(memberCertification._id)
      .populate('memberId', 'fullName email')
      .populate('certificationId', 'name provider category difficulty');

    return NextResponse.json({
      success: true,
      data: populatedCertification
    }, { status: 201 });
  } catch (error) {
    console.error('Error issuing certification:', error);
    return NextResponse.json(
      { error: 'Failed to issue certification' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk operations (revoke, renew, etc.)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { certificationIds, action, updatedBy, expiryDate } = body;

    if (!certificationIds || !Array.isArray(certificationIds) || certificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Certification IDs are required' },
        { status: 400 }
      );
    }

    if (!action || !updatedBy) {
      return NextResponse.json(
        { error: 'Action and updatedBy are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'revoke':
        updateData.status = 'revoked';
        updateData.revokedDate = new Date();
        updateData.revokedBy = updatedBy;
        break;
      case 'renew':
        updateData.status = 'active';
        updateData.renewedDate = new Date();
        updateData.renewedBy = updatedBy;
        if (expiryDate) {
          updateData.expiryDate = new Date(expiryDate);
        }
        break;
      case 'expire':
        updateData.status = 'expired';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await MemberCertification.updateMany(
      { _id: { $in: certificationIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} certifications updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating member certifications:', error);
    return NextResponse.json(
      { error: 'Failed to update member certifications' },
      { status: 500 }
    );
  }
}