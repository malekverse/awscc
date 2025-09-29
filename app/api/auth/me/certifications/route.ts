import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MemberCertification } from '@/models/Certification';
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
    const status = searchParams.get('status') || 'active';

    // Build filter for member's certifications
    const filter: any = {
      memberId: member._id
    };

    if (status !== 'all') {
      filter.status = status;
    }

    // Fetch member's certifications
    const certifications = await MemberCertification.find(filter)
      .populate('certificationId', 'name description issuer category difficulty badgeUrl')
      .sort({ issuedDate: -1 })
      .lean();

    // Transform data for frontend
    const transformedCertifications = certifications.map(cert => ({
      id: cert._id,
      name: cert.certificationId?.name || 'Unknown Certification',
      description: cert.certificationId?.description || '',
      issuer: cert.certificationId?.issuer || '',
      category: cert.certificationId?.category || '',
      difficulty: cert.certificationId?.difficulty || 'beginner',
      earnedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      status: cert.status,
      certificateNumber: cert.certificateNumber,
      certificateUrl: cert.certificateUrl,
      badgeUrl: cert.certificationId?.badgeUrl,
      verificationCode: cert.verificationCode,
      type: 'certification' // For compatibility with dashboard interface
    }));

    return NextResponse.json({
      success: true,
      data: transformedCertifications,
      total: transformedCertifications.length
    });

  } catch (error) {
    console.error('Error fetching member certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    );
  }
}