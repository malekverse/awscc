import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import Admin, { IAdmin } from '@/models/Admin';
import AdminLog from '@/models/AdminLog';
import Member from '@/models/Member';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface AuthTokenPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface MemberTokenPayload {
  _id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(admin: IAdmin): string {
  const payload: AuthTokenPayload = {
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateMemberToken(member: any): string {
  const payload: MemberTokenPayload = {
    _id: member._id.toString(),
    email: member.email,
    role: 'member'
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate random password
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Extract token from request
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('admin-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

// Verify admin authentication
export async function verifyAdminAuth(request: NextRequest): Promise<IAdmin | null> {
  try {
    await connectToDatabase();
    
    const token = extractTokenFromRequest(request);
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }
    
    const admin = await Admin.findById(payload.adminId);
    if (!admin || !admin.isActive) {
      return null;
    }
    
    return admin;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Verify member authentication from request
export async function verifyMemberAuth(request: NextRequest): Promise<Member | null> {
  try {
    const token = request.cookies.get('member-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    await connectToDatabase();
    const member = await Member.findById(decoded._id).select('-password -temporaryPassword -passwordResetToken');
    
    if (!member || !member.isActive || !member.paid) {
      return null;
    }
    
    return member;
  } catch (error) {
    console.error('Member auth verification error:', error);
    return null;
  }
};

// Log admin action
export async function logAdminAction({
  adminId,
  adminEmail,
  action,
  targetType,
  targetId,
  targetEmail,
  details = {},
  ipAddress,
  userAgent
}: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'member' | 'admin' | 'system';
  targetId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await connectToDatabase();
    
    const log = new AdminLog({
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      targetEmail,
      details,
      ipAddress,
      userAgent
    });
    
    await log.save();
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Create default admin (for initial setup)
export async function createDefaultAdmin() {
  try {
    await connectToDatabase();
    
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }
    
    const defaultPassword = 'admin123!@#';
    const admin = new Admin({
      email: 'admin@awscc.tn',
      password: defaultPassword,
      fullName: 'Super Administrator',
      role: 'super_admin',
      isActive: true
    });
    
    await admin.save();
    console.log('Default super admin created:');
    console.log('Email: admin@awscc.tn');
    console.log('Password:', defaultPassword);
    console.log('Please change the password after first login!');
    
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}