const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

// GameSession schema (simplified version)
const gameSessionSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  email: { type: String, required: true },
  gameToken: { type: String, required: true, unique: true },
  currentStation: { type: Number, default: 1 },
  startTime: { type: Date, default: Date.now },
  timeLimit: { type: Number, default: 120 },
  isExpired: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  suspiciousActivity: {
    rapidSubmissions: { type: Number, default: 0 },
    invalidQRAttempts: { type: Number, default: 0 },
    lastSuspiciousAction: { type: Date }
  },
  ipAddress: String,
  userAgent: String
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);

async function checkGameSessions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const sessions = await GameSession.find().sort({ startTime: -1 }).limit(5);
    console.log('\n=== Recent Game Sessions ===');
    
    if (sessions.length === 0) {
      console.log('No game sessions found');
    } else {
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. Token: ${session.gameToken}`);
        console.log(`   Player: ${session.playerName}`);
        console.log(`   Email: ${session.email}`);
        console.log(`   Started: ${session.startTime}`);
        console.log(`   Current Station: ${session.currentStation}`);
        console.log(`   Completed: ${session.isCompleted}`);
        console.log(`   Time Limit: ${session.timeLimit || 'Not set'} minutes`);
        console.log(`   Expired: ${session.isExpired || false}`);
        console.log('   ---');
      });
    }
    
    console.log('\n=== Creating Test Game Session ===');
    
    // Create a test game session
    const testSession = new GameSession({
      playerName: 'Test Player',
      email: 'testplayer@example.com',
      gameToken: 'TEST-' + Date.now(),
      currentStation: 1,
      startTime: new Date(),
      timeLimit: 120, // 2 hours for testing
      isExpired: false,
      suspiciousActivity: {
        rapidSubmissions: 0,
        invalidQRAttempts: 0,
        lastSuspiciousAction: null
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser'
    });
    
    await testSession.save();
    console.log(`Test session created with token: ${testSession.gameToken}`);
    console.log(`Game URL: http://localhost:3000/game/${testSession.gameToken}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGameSessions();