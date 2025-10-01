'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GameTimerProps {
  startTime: string;
  timeLimit: number; // in minutes
  isExpired?: boolean;
  onTimeWarning?: () => void;
  onTimeExpired?: () => void;
}

export function GameTimer({ 
  startTime, 
  timeLimit, 
  isExpired = false,
  onTimeWarning,
  onTimeExpired 
}: GameTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);
  const [hasExpired, setHasExpired] = useState(isExpired);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Validate inputs
      if (!startTime || !timeLimit || isNaN(timeLimit)) {
        console.warn('GameTimer: Invalid startTime or timeLimit', { startTime, timeLimit });
        return 0;
      }

      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      
      // Check if dates are valid
      if (isNaN(start) || isNaN(now)) {
        console.warn('GameTimer: Invalid date values', { startTime, start, now });
        return 0;
      }

      const elapsed = now - start;
      const timeLimitMs = timeLimit * 60 * 1000;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      
      return Math.floor(remaining / 1000); // Convert to seconds
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Check for warning (last 15 minutes)
      const warningThreshold = 15 * 60; // 15 minutes in seconds
      if (remaining <= warningThreshold && remaining > 0 && !isWarning) {
        setIsWarning(true);
        onTimeWarning?.();
      }

      // Check for expiry
      if (remaining <= 0 && !hasExpired) {
        setHasExpired(true);
        onTimeExpired?.();
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, timeLimit, isWarning, hasExpired, onTimeWarning, onTimeExpired]);

  const formatTime = (seconds: number) => {
    // Handle invalid values
    if (isNaN(seconds) || seconds < 0) {
      return '0:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (hasExpired) return 'text-red-600';
    if (isWarning) return 'text-orange-600';
    return 'text-green-600';
  };

  const getTimerBgColor = () => {
    if (hasExpired) return 'bg-red-50 border-red-200';
    if (isWarning) return 'bg-orange-50 border-orange-200';
    return 'bg-green-50 border-green-200';
  };

  if (hasExpired) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          ⏰ Time's up! Your game session has expired.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getTimerBgColor()}`}>
      <Clock className={`h-4 w-4 ${getTimerColor()}`} />
      <span className={`font-mono text-sm font-medium ${getTimerColor()}`}>
        {formatTime(timeRemaining)}
      </span>
      <span className="text-xs text-gray-600">remaining</span>
      
      {isWarning && !hasExpired && (
        <AlertTriangle className="h-4 w-4 text-orange-500 animate-pulse" />
      )}
    </div>
  );
}