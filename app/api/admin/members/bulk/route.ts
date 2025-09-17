import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Member from '@/models/Member';
import { verifyAdminAuth } from '@/lib/auth';

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
    
    const { memberIds, action } = await request.json();
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
        { status: 400 }
      );
    }
    
    if (!['paid', 'unpaid', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'paid':
        result = await Member.updateMany(
          { _id: { $in: memberIds } },
          { $set: { paid: true } }
        );
        break;
        
      case 'unpaid':
        result = await Member.updateMany(
          { _id: { $in: memberIds } },
          { $set: { paid: false } }
        );
        break;
        
      case 'delete':
        result = await Member.deleteMany(
          { _id: { $in: memberIds } }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'delete' ? 'deleted' : 'updated'} ${result.modifiedCount || result.deletedCount} member(s)`,
      affectedCount: result.modifiedCount || result.deletedCount
    });
    
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}