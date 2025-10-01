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
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  playerName: { type: String, required: true },
  email: { type: String, required: true },
  gameToken: { type: String, required: true, unique: true },
  currentStation: { type: Number, default: 1 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  timeLimit: { type: Number, default: 120 },
  isExpired: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  suspiciousActivity: {
    rapidSubmissions: { type: Number, default: 0 },
    invalidQRAttempts: { type: Number, default: 0 },
    lastSuspiciousAction: { type: Date }
  },
  ipAddress: String,
  userAgent: String,
  badges: [String],
  stationsCompleted: [Number],
  qrCodesScanned: [String],
  hints: [{
    stationId: Number,
    hintText: String,
    usedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Add the methods that might be causing issues
gameSessionSchema.methods.isSessionExpired = function() {
  const now = new Date();
  const timeLimitMs = this.timeLimit * 60 * 1000;
  const sessionDuration = now.getTime() - this.startTime.getTime();
  return sessionDuration > timeLimitMs;
};

gameSessionSchema.methods.checkAndUpdateExpiry = function() {
  if (this.isSessionExpired() && !this.isExpired) {
    this.isExpired = true;
    this.isActive = false;
  }
  return this.isExpired;
};

gameSessionSchema.methods.isSuspiciousSession = function() {
  return (
    this.suspiciousActivity.rapidSubmissions > 10 ||
    this.suspiciousActivity.invalidQRAttempts > 20
  );
};

gameSessionSchema.methods.validateSessionIntegrity = function() {
  try {
    // Check if session is expired
    if (this.checkAndUpdateExpiry()) {
      return { valid: false, reason: 'Session expired' };
    }
    
    // Check if session is suspicious
    if (this.isSuspiciousSession()) {
      return { valid: false, reason: 'Suspicious activity detected' };
    }
    
    // Check if session is active
    if (!this.isActive) {
      return { valid: false, reason: 'Session is inactive' };
    }
    
    // Check if game is already completed
    if (this.isCompleted) {
      return { valid: false, reason: 'Game already completed' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error in validateSessionIntegrity:', error);
    return { valid: false, reason: 'Validation error: ' + error.message };
  }
};

const GameSession = mongoose.model('GameSession', gameSessionSchema);

async function debugGameSession() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    // Check the specific token that was causing issues
    const problemToken = 'vkuyvp99l9goe2fsbgg8zp';
    console.log(`\n=== Debugging token: ${problemToken} ===`);
    
    const session = await GameSession.findOne({ gameToken: problemToken });
    
    if (!session) {
      console.log('Session not found in database');
    } else {
      console.log('Session found:');
      console.log('- Player:', session.playerName);
      console.log('- Email:', session.email);
      console.log('- Start Time:', session.startTime);
      console.log('- Is Active:', session.isActive);
      console.log('- Is Completed:', session.isCompleted);
      console.log('- Is Expired:', session.isExpired);
      console.log('- Time Limit:', session.timeLimit);
      console.log('- Current Station:', session.currentStation);
      console.log('- Suspicious Activity:', session.suspiciousActivity);
      
      // Test the validation method
      console.log('\n=== Testing validateSessionIntegrity ===');
      try {
        const validation = session.validateSessionIntegrity();
        console.log('Validation result:', validation);
      } catch (error) {
        console.error('Error during validation:', error);
      }
    }
    
    // Also check all active sessions
    console.log('\n=== All Active Sessions ===');
    const activeSessions = await GameSession.find({ isActive: true }).sort({ startTime: -1 });
    console.log(`Found ${activeSessions.length} active sessions`);
    
    activeSessions.forEach((session, index) => {
      console.log(`${index + 1}. Token: ${session.gameToken}`);
      console.log(`   Player: ${session.playerName}`);
      console.log(`   Started: ${session.startTime}`);
      console.log(`   Active: ${session.isActive}`);
      console.log(`   Completed: ${session.isCompleted}`);
      console.log('   ---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugGameSession();