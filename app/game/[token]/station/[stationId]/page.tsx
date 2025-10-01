'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trophy, CheckCircle, Lightbulb, QrCode } from 'lucide-react';
import { toast } from 'sonner';


// Station Components
import Station1 from './components/Station1';
import Station2 from './components/Station2';
import Station3 from './components/Station3';
import Station4 from './components/Station4';
import Station5 from './components/Station5';

interface GameSession {
  id: string;
  playerName: string;
  currentStation: number;
  stationsCompleted: number[];
  qrCodesScanned: string[];
  badges: string[];
  isCompleted: boolean;
  startTime: string;
  timeLimit: number;
  isExpired: boolean;
}

export default function StationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const stationId = parseInt(params.stationId as string);
  
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [qrValidated, setQrValidated] = useState(false);

  const stationInfo = {
    1: {
      name: 'Welcome Station',
      location: 'Cour (Courtyard)',
      badge: 'Cloud Explorer',
      emoji: '☁️',
      qrCode: 'AWS',
      description: 'Begin your journey with an introductory riddle about cloud computing'
    },
    2: {
      name: 'Knowledge Hub',
      location: 'Library',
      badge: 'AWS Scholar',
      emoji: '📚',
      qrCode: 'Builders',
      description: 'Test your AWS knowledge with an interactive service matching puzzle'
    },
    3: {
      name: 'Navigation Challenge',
      location: 'Corridor',
      badge: 'Path Finder',
      emoji: '🧭',
      qrCode: 'Free',
      description: 'Navigate through a maze of QR codes to find the correct path'
    },
    4: {
      name: 'Discovery Zone',
      location: 'Cafeteria',
      badge: 'Clue Hunter',
      emoji: '🔍',
      qrCode: 'Lambda',
      description: 'Find hidden AWS clues in a themed menu'
    },
    5: {
      name: 'Final Challenge',
      location: 'Amphitheatre',
      badge: 'Cloud Master',
      emoji: '🏆',
      qrCode: 'S3',
      description: 'Complete the ultimate AWS phrase puzzle to finish your quest'
    }
  };

  useEffect(() => {
    fetchGameSession();
  }, [token]);

  const fetchGameSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/game/session/${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch game session');
      }
      
      const data = await response.json();
      setGameSession(data.session);
      
      // Check if QR code for this station is already scanned
      const station = stationInfo[stationId as keyof typeof stationInfo];
      if (station && data.session.qrCodesScanned.includes(station.qrCode)) {
        setQrValidated(true);
      }
    } catch (error) {
      console.error('Error fetching game session:', error);
      toast.error('Failed to load game session');
      router.push(`/game/${token}`);
    } finally {
      setLoading(false);
    }
  };

  const validateQRCode = async (qrCode: string) => {
    try {
      const response = await fetch(`/api/game/session/${token}/validate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: qrCode,
          stationNumber: stationId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrValidated(true);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message || data.error);
        return false;
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      toast.error('Failed to validate QR code');
      return false;
    }
  };

  const completeStation = async (answer?: string) => {
    if (!gameSession) return;

    setCompleting(true);
    try {
      const response = await fetch(`/api/game/session/${token}/complete-station`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationNumber: stationId,
          answer: answer,
          badge: stationInfo[stationId as keyof typeof stationInfo]?.badge
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        
        if (data.isGameCompleted) {
          toast.success('🎉 Congratulations! You completed Cloud Conquest!');
          setTimeout(() => {
            router.push(`/game/certificate/${token}`);
          }, 2000);
        } else {
          setTimeout(() => {
            router.push(`/game/${token}`);
          }, 1500);
        }
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.error('Error completing station:', error);
      toast.error('Failed to complete station');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading station...</p>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80 flex items-center justify-center">
        <p className="text-lg text-foreground/70">Game session not found</p>
      </div>
    );
  }

  const station = stationInfo[stationId as keyof typeof stationInfo];
  if (!station) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80 flex items-center justify-center">
        <p className="text-lg text-foreground/70">Station not found</p>
      </div>
    );
  }

  // Check if station is accessible
  if (stationId > gameSession.currentStation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 text-xl font-bold">Station Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <AlertDescription className="text-red-800 dark:text-red-300">
                You need to complete previous stations first!
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push(`/game/${token}`)} 
              className="w-full mt-4 bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] hover:opacity-90 text-white font-semibold shadow-lg"
            >
              Return to Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if station is already completed
  if (gameSession.stationsCompleted.includes(stationId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800 dark:text-green-400 text-xl font-bold">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
              Station Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <AlertDescription className="text-green-800 dark:text-green-300">
                You have already completed this station! You earned the "{station.badge}" badge.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push(`/game/${token}`)} 
              className="w-full mt-4 bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] hover:opacity-90 text-white font-semibold shadow-lg"
            >
              Return to Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStationComponent = () => {
    const commonProps = {
      onComplete: completeStation,
      completing: completing,
      qrValidated: qrValidated,
      onQRValidate: validateQRCode,
      station: station
    };

    switch (stationId) {
      case 1:
        return <Station1 {...commonProps} />;
      case 2:
        return <Station2 {...commonProps} />;
      case 3:
        return <Station3 {...commonProps} />;
      case 4:
        return <Station4 {...commonProps} />;
      case 5:
        return <Station5 {...commonProps} />;
      default:
        return <div>Station not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push(`/game/${token}`)}
              className="mr-4 hover:bg-primary/10 text-primary border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Game
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] bg-clip-text text-transparent flex items-center">
                <span className="text-5xl mr-4">{station.emoji}</span>
                {station.name}
              </h1>
              <p className="text-xl text-foreground/70 font-medium mt-1">{station.location}</p>
            </div>
          </div>
        </div>

        {/* Station Content */}
        {renderStationComponent()}
      </div>
    </div>
  );
}