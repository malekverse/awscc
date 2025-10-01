import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Game Session document
export interface IGameSession extends Document {
  memberId: mongoose.Types.ObjectId;
  playerName: string;
  email: string;
  gameToken: string;
  startTime: Date;
  endTime?: Date;
  currentStation: number;
  isCompleted: boolean;
  badges: string[];
  stationsCompleted: number[];
  lastActivity: Date;
  isActive: boolean;
  completionTime?: number; // in minutes
  qrCodesScanned: string[];
  hints: {
    stationId: number;
    hintText: string;
    usedAt: Date;
  }[];
  // Anti-cheat measures
  timeLimit: number; // in minutes (default: 360 minutes = 6 hours)
  isExpired: boolean;
  suspiciousActivity: {
    rapidSubmissions: number;
    invalidQRAttempts: number;
    lastSuspiciousAction: Date;
  };
  ipAddress?: string;
  userAgent?: string;
}

// Create the Game Session schema
const GameSessionSchema: Schema = new Schema(
  {
    memberId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member', 
      required: true 
    },
    playerName: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    gameToken: { 
      type: String, 
      required: true, 
      unique: true 
    },
    startTime: { 
      type: Date, 
      default: Date.now 
    },
    endTime: { 
      type: Date 
    },
    currentStation: { 
      type: Number, 
      default: 1,
      min: 1,
      max: 5
    },
    isCompleted: { 
      type: Boolean, 
      default: false 
    },
    badges: [{ 
      type: String 
    }],
    stationsCompleted: [{ 
      type: Number,
      min: 1,
      max: 5
    }],
    lastActivity: { 
      type: Date, 
      default: Date.now 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    completionTime: { 
      type: Number // in minutes
    },
    qrCodesScanned: [{ 
      type: String 
    }],
    hints: [{
      stationId: { type: Number, required: true },
      hintText: { type: String, required: true },
      usedAt: { type: Date, default: Date.now }
    }],
    // Anti-cheat measures
    timeLimit: { 
      type: Number, 
      default: 360 // 6 hours in minutes
    },
    isExpired: { 
      type: Boolean, 
      default: false 
    },
    suspiciousActivity: {
      rapidSubmissions: { type: Number, default: 0 },
      invalidQRAttempts: { type: Number, default: 0 },
      lastSuspiciousAction: { type: Date }
    },
    ipAddress: { 
      type: String 
    },
    userAgent: { 
      type: String 
    }
  },
  { 
    timestamps: true,
    indexes: [
      { gameToken: 1 },
      { memberId: 1 },
      { isCompleted: 1 },
      { isActive: 1 }
    ]
  }
);

// Static method to generate a unique game token
GameSessionSchema.statics.generateToken = function() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 20; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Instance method to calculate progress percentage
GameSessionSchema.methods.getProgressPercentage = function() {
  return (this.stationsCompleted.length / 5) * 100;
};

// Instance method to get next station
GameSessionSchema.methods.getNextStation = function() {
  if (this.isCompleted) return null;
  return this.currentStation <= 5 ? this.currentStation : null;
};

// Instance method to complete a station
GameSessionSchema.methods.completeStation = function(stationNumber: number, badge: string) {
  try {
    if (this.stationsCompleted.includes(stationNumber)) {
      return {
        success: false,
        error: 'Station already completed',
        message: 'You have already completed this station!'
      };
    }

    this.stationsCompleted.push(stationNumber);
    this.badges.push(badge);
    
    // Check if game is completed
    if (this.stationsCompleted.length === 5) {
      this.isCompleted = true;
      this.endTime = new Date();
      this.completionTime = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
      // Keep currentStation at 5 when game is completed
      this.currentStation = 5;
    } else {
      // Only increment if not at the final station
      this.currentStation = stationNumber + 1;
    }
    
    this.lastActivity = new Date();

    return {
      success: true,
      message: `Station ${stationNumber} completed successfully!`,
      stationCompleted: stationNumber,
      badgeAwarded: badge
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to complete station',
      message: 'An error occurred while completing the station.'
    };
  }
};

// Anti-cheat validation methods
GameSessionSchema.methods.isSessionExpired = function() {
  const now = new Date();
  const timeLimitMs = this.timeLimit * 60 * 1000; // Convert minutes to milliseconds
  const sessionDuration = now.getTime() - this.startTime.getTime();
  return sessionDuration > timeLimitMs;
};

GameSessionSchema.methods.checkAndUpdateExpiry = function() {
  if (this.isSessionExpired() && !this.isExpired) {
    this.isExpired = true;
    this.isActive = false;
  }
  return this.isExpired;
};

GameSessionSchema.methods.recordSuspiciousActivity = function(activityType: 'rapid_submission' | 'invalid_qr') {
  if (activityType === 'rapid_submission') {
    this.suspiciousActivity.rapidSubmissions += 1;
  } else if (activityType === 'invalid_qr') {
    this.suspiciousActivity.invalidQRAttempts += 1;
  }
  this.suspiciousActivity.lastSuspiciousAction = new Date();
};

GameSessionSchema.methods.isSuspiciousSession = function() {
  return (
    this.suspiciousActivity.rapidSubmissions > 10 || // More than 10 rapid submissions
    this.suspiciousActivity.invalidQRAttempts > 20    // More than 20 invalid QR attempts
  );
};

GameSessionSchema.methods.validateSessionIntegrity = function() {
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
};

// Pre-save middleware to update lastActivity and check expiry
GameSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  this.checkAndUpdateExpiry();
  next();
});

// Create and export the model
export default mongoose.models.GameSession || mongoose.model<IGameSession>('GameSession', GameSessionSchema);