import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import GameSession from '@/models/GameSession';

export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    await connectToDatabase();
    
    const { certificateId } = params;
    
    // Find the game session by certificate ID (which could be either gameToken or _id)
    let session = await GameSession.findOne({ 
      gameToken: certificateId,
      isCompleted: true 
    });
    
    // If not found by gameToken, try finding by _id
    if (!session) {
      try {
        session = await GameSession.findOne({ 
          _id: certificateId,
          isCompleted: true 
        });
      } catch (error) {
        // Invalid ObjectId format, continue with null session
      }
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Certificate not found or game not completed' },
        { status: 404 }
      );
    }
    
    // Format the session data for the certificate
    const certificateData = {
      _id: session._id,
      playerName: session.playerName,
      email: session.email,
      gameToken: session.gameToken,
      startTime: session.startTime,
      endTime: session.endTime,
      completionTime: session.completionTime,
      badges: session.badges,
      stationsCompleted: session.stationsCompleted,
      isCompleted: session.isCompleted
    };
    
    return NextResponse.json({
      success: true,
      session: certificateData
    });
    
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}