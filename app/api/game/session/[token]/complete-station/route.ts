import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import GameSession from '@/models/GameSession';

// POST - Complete a station and award badge
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();
    
    const { token } = params;
    const { stationNumber, answer, badge } = await request.json();
    
    if (!token || !stationNumber) {
      return NextResponse.json(
        { error: 'Game token and station number are required' },
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

    // Check for rapid submissions (anti-cheat)
    const now = new Date();
    const lastActivity = gameSession.lastActivity;
    const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
    
    if (timeSinceLastActivity < 5000) { // Less than 5 seconds
      gameSession.recordSuspiciousActivity('rapid_submission');
      await gameSession.save();
      
      return NextResponse.json({
        success: false,
        error: 'Too fast! Please wait a moment before submitting.',
        message: 'Take your time to complete the challenge properly.'
      }, { status: 429 });
    }

    // Check if player is at the correct station
    if (gameSession.currentStation !== stationNumber) {
      return NextResponse.json({
        success: false,
        error: 'Station not accessible',
        message: 'You need to complete previous stations first!'
      }, { status: 400 });
    }

    // Check if station is already completed
    if (gameSession.stationsCompleted.includes(stationNumber)) {
      return NextResponse.json({
        success: false,
        error: 'Station already completed',
        message: 'You have already completed this station!'
      }, { status: 400 });
    }

    // Define correct answers for each station
    const correctAnswers = {
      1: null, // Station 1 is just a riddle, no specific answer needed
      2: 'aws-services-matched', // Station 2 requires matching AWS services
      3: null, // Station 3 is QR maze, no specific answer
      4: 'lambda-burger-found', // Station 4 requires finding the Lambda Burger
      5: 'AWS Builders Build Free with Lambda and S3' // Station 5 final phrase
    };

    // Validate answer if required
    if (correctAnswers[stationNumber] && answer !== correctAnswers[stationNumber]) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect answer',
        message: 'That\'s not quite right. Try again!'
      }, { status: 400 });
    }

    // Complete the station
    console.log('🔍 Before completeStation - currentStation:', gameSession.currentStation);
    console.log('🔍 Station number:', stationNumber);
    console.log('🔍 Stations completed:', gameSession.stationsCompleted);
    
    const result = await gameSession.completeStation(stationNumber, answer, badge || `Station ${stationNumber} Badge`);
    
    console.log('🔍 After completeStation - result:', result);
    console.log('🔍 After completeStation - currentStation:', gameSession.currentStation);
    console.log('🔍 After completeStation - isCompleted:', gameSession.isCompleted);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      }, { status: 400 });
    }

    console.log('🔍 About to save gameSession...');
    // Save the updated game session
    await gameSession.save();

    // Check if game is completed
    const isGameCompleted = gameSession.stationsCompleted.length === 5;
    if (isGameCompleted && !gameSession.isCompleted) {
      gameSession.isCompleted = true;
      gameSession.endTime = new Date();
      gameSession.completionTime = gameSession.endTime.getTime() - gameSession.startTime.getTime();
      await gameSession.save();
    }

    return NextResponse.json({
      success: true,
      message: `Station ${stationNumber} completed successfully!`,
      stationCompleted: stationNumber,
      badgeAwarded: badge || `Station ${stationNumber} Badge`,
      isGameCompleted: isGameCompleted,
      session: {
        currentStation: gameSession.currentStation,
        stationsCompleted: gameSession.stationsCompleted,
        badges: gameSession.badges,
        isCompleted: gameSession.isCompleted,
        progress: gameSession.getProgressPercentage(),
        nextStation: gameSession.getNextStation(),
        completionTime: gameSession.completionTime
      }
    });

  } catch (error) {
    console.error('Error completing station:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}