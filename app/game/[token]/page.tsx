'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, MapPin, QrCode, CheckCircle, Lock, Star } from 'lucide-react';
import { toast } from 'sonner';


interface GameSession {
  id: string;
  playerName: string;
  email: string;
  gameToken: string;
  currentStation: number;
  isCompleted: boolean;
  badges: string[];
  stationsCompleted: number[];
  startTime: string;
  endTime?: string;
  completionTime?: number;
  progress: number;
  nextStation: number;
  qrCodesScanned: string[];
  hints: string[];
  timeLimit: number;
  isExpired: boolean;
}

interface Station {
  id: number;
  name: string;
  location: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  badge: string;
  emoji: string;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const stations: Station[] = [
    {
      id: 1,
      name: "Welcome Station",
      location: "Cour (Courtyard)",
      description: "Start your Cloud Conquest journey with an introductory riddle",
      isUnlocked: false,
      isCompleted: false,
      badge: "Cloud Explorer",
      emoji: "☁️"
    },
    {
      id: 2,
      name: "Knowledge Hub",
      location: "Library",
      description: "Match AWS services in an interactive puzzle",
      isUnlocked: false,
      isCompleted: false,
      badge: "AWS Scholar",
      emoji: "📚"
    },
    {
      id: 3,
      name: "Navigation Challenge",
      location: "Corridor",
      description: "Navigate through a QR code maze",
      isUnlocked: false,
      isCompleted: false,
      badge: "Path Finder",
      emoji: "🧭"
    },
    {
      id: 4,
      name: "Discovery Zone",
      location: "Cafeteria",
      description: "Find hidden clues in an AWS-themed menu",
      isUnlocked: false,
      isCompleted: false,
      badge: "Clue Hunter",
      emoji: "🔍"
    },
    {
      id: 5,
      name: "Final Challenge",
      location: "Amphitheatre",
      description: "Complete the ultimate AWS phrase puzzle",
      isUnlocked: false,
      isCompleted: false,
      badge: "Cloud Master",
      emoji: "🏆"
    }
  ];

  useEffect(() => {
    fetchGameSession();
  }, [token]);

  const fetchGameSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/game/session/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch game session');
      }
      
      const data = await response.json();
      setGameSession(data.session);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching game session:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStationStatus = (stations: Station[], session: GameSession): Station[] => {
    return stations.map(station => ({
      ...station,
      isCompleted: session.stationsCompleted.includes(station.id),
      isUnlocked: station.id <= session.currentStation
    }));
  };

  const handleStationClick = (stationId: number) => {
    if (!gameSession) return;
    
    const station = stations.find(s => s.id === stationId);
    if (!station) return;
    
    const updatedStations = updateStationStatus(stations, gameSession);
    const currentStation = updatedStations.find(s => s.id === stationId);
    
    if (!currentStation?.isUnlocked) {
      toast.error('This station is locked. Complete previous stations first!');
      return;
    }
    
    if (currentStation.isCompleted) {
      toast.info('You have already completed this station!');
      return;
    }
    
    setSelectedStation(stationId);
    router.push(`/game/${token}/station/${stationId}`);
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your Cloud Conquest adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Game Session Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Game session not found</p>
      </div>
    );
  }

  const updatedStations = updateStationStatus(stations, gameSession);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-white dark:from-background dark:to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] bg-clip-text text-transparent mb-2">
            ☁️ Cloud Conquest
          </h1>
          <p className="text-xl text-foreground/80 mb-4 font-medium">
            Welcome, {gameSession.playerName}!
          </p>
          

          
          {gameSession.isCompleted ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-4 rounded-xl mb-6 shadow-sm">
              <div className="flex items-center justify-center">
                <Trophy className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                <span className="font-semibold">
                  Congratulations! You completed Cloud Conquest in {gameSession.completionTime ? formatTime(gameSession.completionTime) : 'N/A'}!
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-sm text-foreground/70 mr-2 font-medium">Progress:</span>
                <span className="font-bold text-xl text-foreground">{gameSession.progress}%</span>
              </div>
              <Progress value={gameSession.progress} className="w-full max-w-md mx-auto h-3" />
            </div>
          )}
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {updatedStations.map((station) => (
            <Card
              key={station.id}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                station.isCompleted 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 shadow-green-100' 
                  : station.isUnlocked 
                    ? 'bg-white dark:bg-background/50 border-primary/30 hover:border-primary/50 shadow-primary/10 hover:shadow-primary/20' 
                    : 'bg-gradient-to-br from-secondary/20 to-secondary/30 dark:from-background/30 dark:to-background/50 border-border opacity-70'
              }`}
              onClick={() => handleStationClick(station.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg flex items-center font-bold ${
                    station.isCompleted ? 'text-green-800 dark:text-green-200' : station.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    <span className="text-3xl mr-3">{station.emoji}</span>
                    Station {station.id}
                  </CardTitle>
                  <div className="flex items-center">
                    {station.isCompleted && (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    )}
                    {!station.isUnlocked && (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardDescription className={`font-semibold text-lg ${
                  station.isCompleted ? 'text-green-700 dark:text-green-300' : station.isUnlocked ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {station.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center text-sm font-medium ${
                    station.isCompleted ? 'text-green-700 dark:text-green-300' : station.isUnlocked ? 'text-foreground/70' : 'text-muted-foreground'
                  }`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {station.location}
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    station.isCompleted ? 'text-green-700 dark:text-green-300' : station.isUnlocked ? 'text-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {station.description}
                  </p>
                  {station.isCompleted && (
                    <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 font-medium">
                      <Star className="h-3 w-3 mr-1" />
                      {station.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            onClick={handleQRScan}
            className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={gameSession.isCompleted}
            size="lg"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Scan QR Code
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push(`/game/leaderboard`)}
            className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-300"
            size="lg"
          >
            <Trophy className="h-5 w-5 mr-2" />
            View Leaderboard
          </Button>
          
          {gameSession.isCompleted && (
            <Button 
              onClick={() => router.push(`/game/certificate/${gameSession.id}`)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Get Certificate
            </Button>
          )}
        </div>

        {/* Game Instructions */}
        <Card className="bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">How to Play</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <p className="text-white/90">Visit each station in order to unlock the next one</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <p className="text-white/90">Scan QR codes at each location to unlock station challenges</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <p className="text-white/90">Complete puzzles and challenges to earn badges</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                <p className="text-white/90">Finish all 5 stations to complete your Cloud Conquest!</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</div>
                <p className="text-white/90">Get your digital certificate upon completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}