import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { generateMemberToken, getClientIP } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find member by email
    const member = await Member.findOne({ email: email.toLowerCase() });
    if (!member) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if member has paid
    if (!member.paid) {
      return NextResponse.json(
        { error: 'Access denied. Please complete your payment to access the dashboard.' },
        { status: 403 }
      );
    }
    
    // Check if member is active
    if (!member.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      );
    }
    
    // Verify password
    if (!member.password) {
      return NextResponse.json(
        { error: 'Account not activated. Please contact admin.' },
        { status: 401 }
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, member.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    member.lastLogin = new Date();
    await member.save();
    
    // Generate JWT token for member
    const token = generateMemberToken(member);
    
    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      member: {
        id: member._id,
        email: member.email,
        fullName: member.fullName,
        organization: member.organization,
        lastLogin: member.lastLogin,
        paidDate: member.paidDate
      }
    });
    
    // Set HTTP-only cookie
    response.cookies.set('member-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('Member login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}