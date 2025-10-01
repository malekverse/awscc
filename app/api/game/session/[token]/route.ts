import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import GameSession from '@/models/GameSession';

// GET - Retrieve game session by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();
    
    const { token } = params;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Game token is required' },
        { status: 400 }
      );
    }

    const gameSession = await GameSession.findOne({ 
      gameToken: token,
      isActive: true 
    });

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found or inactive' },
        { status: 404 }
      );
    }

    // Validate session integrity (anti-cheat)
    const validation = gameSession.validateSessionIntegrity();
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 403 }
      );
    }

    // Update last activity
    gameSession.lastActivity = new Date();
    await gameSession.save();

    return NextResponse.json({
      success: true,
      session: {
        id: gameSession._id,
        playerName: gameSession.playerName,
        email: gameSession.email,
        gameToken: gameSession.gameToken,
        currentStation: gameSession.currentStation,
        isCompleted: gameSession.isCompleted,
        badges: gameSession.badges,
        stationsCompleted: gameSession.stationsCompleted,
        startTime: gameSession.startTime,
        endTime: gameSession.endTime,
        completionTime: gameSession.completionTime,
        progress: gameSession.getProgressPercentage(),
        nextStation: gameSession.getNextStation(),
        qrCodesScanned: gameSession.qrCodesScanned,
        hints: gameSession.hints
      }
    });

  } catch (error) {
    console.error('Error retrieving game session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update game session progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();
    
    const { token } = params;
    const body = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Game token is required' },
        { status: 400 }
      );
    }

    const gameSession = await GameSession.findOne({ 
      gameToken: token,
      isActive: true 
    });

    if (!gameSession) {
      return NextResponse.json(
        { error: 'Game session not found or inactive' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'currentStation',
      'badges',
      'stationsCompleted',
      'isCompleted',
      'endTime',
      'completionTime',
      'qrCodesScanned',
      'hints'
    ];

    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        gameSession[field] = body[field];
      }
    });

    // Update last activity
    gameSession.lastActivity = new Date();

    await gameSession.save();

    return NextResponse.json({
      success: true,
      message: 'Game session updated successfully',
      session: {
        id: gameSession._id,
        playerName: gameSession.playerName,
        email: gameSession.email,
        gameToken: gameSession.gameToken,
        currentStation: gameSession.currentStation,
        isCompleted: gameSession.isCompleted,
        badges: gameSession.badges,
        stationsCompleted: gameSession.stationsCompleted,
        startTime: gameSession.startTime,
        endTime: gameSession.endTime,
        completionTime: gameSession.completionTime,
        progress: gameSession.getProgressPercentage(),
        nextStation: gameSession.getNextStation(),
        qrCodesScanned: gameSession.qrCodesScanned,
        hints: gameSession.hints
      }
    });

  } catch (error) {
    console.error('Error updating game session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}