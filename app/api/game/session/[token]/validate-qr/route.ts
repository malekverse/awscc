import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import GameSession from '@/models/GameSession';

// POST - Validate QR code and unlock station
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectToDatabase();
    
    const { token } = params;
    const { qrCode, stationNumber } = await request.json();
    
    if (!token || !qrCode || !stationNumber) {
      return NextResponse.json(
        { error: 'Game token, QR code, and station number are required' },
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

    // Define valid QR codes for each station
    const validQRCodes = {
      1: 'AWS',
      2: 'Builders', 
      3: 'Free',
      4: 'Lambda',
      5: 'S3'
    };

    // Check if QR code is valid for the station
    if (validQRCodes[stationNumber] !== qrCode) {
      // Record suspicious activity for invalid QR attempts
      gameSession.recordSuspiciousActivity('invalid_qr');
      await gameSession.save();
      
      return NextResponse.json({
        success: false,
        error: 'Invalid QR code for this station',
        message: '☁️ Try again! This QR code doesn\'t belong to this station.'
      }, { status: 400 });
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

    // Check if QR code was already scanned
    if (gameSession.qrCodesScanned.includes(qrCode)) {
      return NextResponse.json({
        success: false,
        error: 'QR code already used',
        message: 'This QR code has already been scanned!'
      }, { status: 400 });
    }

    // Add QR code to scanned list
    gameSession.qrCodesScanned.push(qrCode);
    
    // Update last activity
    gameSession.lastActivity = new Date();
    
    await gameSession.save();

    return NextResponse.json({
      success: true,
      message: 'QR code validated successfully! Station unlocked.',
      stationUnlocked: stationNumber,
      qrCode: qrCode,
      session: {
        currentStation: gameSession.currentStation,
        qrCodesScanned: gameSession.qrCodesScanned,
        progress: gameSession.getProgressPercentage()
      }
    });

  } catch (error) {
    console.error('Error validating QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}