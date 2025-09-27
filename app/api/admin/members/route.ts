import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const paidFilter = searchParams.get('paid'); // 'true', 'false', or null
    const sortBy = searchParams.get('sortBy') || 'submissionDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (paidFilter !== null) {
      query.paid = paidFilter === 'true';
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get members with pagination
    const [members, totalCount] = await Promise.all([
      Member.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password -temporaryPassword -passwordResetToken')
        .lean(),
      Member.countDocuments(query)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });
    
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new member account
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
      fullName,
      email,
      phone,
      dob,
      role,
      organization,
      linkedin,
      experience,
      certifications,
      otherPlatforms,
      whyJoin,
      interests,
      otherInterest,
      contribution,
      meetingPreference,
      heardFrom,
      otherSourceText,
      agreement = true,
      paid = false,
      password,
      isActive = true,
      paidBy
    } = body;

    // Validate required fields
    if (!fullName || !email || !dob || !role || !experience || !whyJoin || !interests || !contribution || !meetingPreference || !heardFrom) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create member
    const member = new Member({
      fullName,
      email,
      phone,
      dob,
      role,
      organization,
      linkedin,
      experience,
      certifications,
      otherPlatforms,
      whyJoin,
      interests,
      otherInterest,
      contribution,
      meetingPreference,
      heardFrom,
      otherSourceText,
      agreement,
      paid,
      password: hashedPassword,
      isActive,
      paidBy: paid ? paidBy : undefined,
      paidDate: paid ? new Date() : undefined,
      emailSent: true // Admin-created accounts are pre-verified
    });

    await member.save();

    // Return member without sensitive fields
    const { password: _, temporaryPassword, passwordResetToken, ...memberWithoutPassword } = member.toObject();

    return NextResponse.json({
      success: true,
      data: memberWithoutPassword
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}

// PATCH - Bulk operations (activate/deactivate, mark as paid, etc.)
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
    const { memberIds, action, updatedBy } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
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
      case 'activate':
        updateData.isActive = true;
        break;
      case 'deactivate':
        updateData.isActive = false;
        break;
      case 'markPaid':
        updateData.paid = true;
        updateData.paidDate = new Date();
        updateData.paidBy = updatedBy;
        break;
      case 'markUnpaid':
        updateData.paid = false;
        updateData.paidDate = undefined;
        updateData.paidBy = undefined;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await Member.updateMany(
      { _id: { $in: memberIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} members updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating members:', error);
    return NextResponse.json(
      { error: 'Failed to update members' },
      { status: 500 }
    );
  }
}