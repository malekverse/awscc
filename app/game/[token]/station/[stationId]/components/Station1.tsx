'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Lightbulb, CheckCircle } from 'lucide-react';

interface Station1Props {
  onComplete: (answer?: string) => void;
  completing: boolean;
  qrValidated: boolean;
  onQRValidate: (qrCode: string) => Promise<boolean>;
  station: {
    name: string;
    location: string;
    badge: string;
    emoji: string;
    qrCode: string;
    description: string;
  };
}

export default function Station1({ onComplete, completing, qrValidated, onQRValidate, station }: Station1Props) {
  const [qrInput, setQrInput] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleQRSubmit = async () => {
    const success = await onQRValidate(qrInput);
    if (success) {
      setQrInput('');
    }
  };

  const handleComplete = () => {
    // Complete the station with no specific answer required
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* QR Code Validation */}
      {!qrValidated && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <QrCode className="h-5 w-5 mr-2" />
              Step 1: Find and Scan the QR Code
            </CardTitle>
            <CardDescription className="text-orange-700">
              Look around the {station.location} for a QR code. Use it's value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Enter the QR code text"
                className="flex-1"
              />
              <Button onClick={handleQRSubmit} disabled={!qrInput.trim()}>
                Validate
              </Button>
            </div>
            <p className="text-sm text-orange-600 mt-2">
              💡 Hint: Look for AWS-related signage or displays in the courtyard
            </p>
          </CardContent>
        </Card>
      )}

      {/* Station Challenge */}
      {qrValidated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Welcome to Cloud Conquest!
            </CardTitle>
            <CardDescription>
              Solve this riddle to begin your AWS journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🌟 Welcome, Cloud Explorer!
              </h3>
              <p className="text-blue-700 mb-4">
                You're about to embark on an exciting journey through the world of AWS! 
                This is your starting point in the Cloud Conquest treasure hunt.
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-blue-400">
                <p className="text-gray-800 font-medium italic">
                  "Welcome to the cloud, where possibilities are endless,<br />
                  Where servers scale and storage is boundless.<br />
                  Your journey begins with this simple quest,<br />
                  To learn about AWS and put skills to the test.<br />
                  Are you ready to explore what the cloud has in store?"
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">
                🎯 Your Mission:
              </h4>
              <p className="text-green-700 mb-3">
                Complete 5 challenging stations to master AWS concepts and earn your Cloud Conquest certificate!
              </p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Station 1: Welcome Station (You are here!)</li>
                <li>• Station 2: Knowledge Hub - AWS Service Matching</li>
                <li>• Station 3: Navigation Challenge - QR Code Maze</li>
                <li>• Station 4: Discovery Zone - Find AWS Clues</li>
                <li>• Station 5: Final Challenge - Architecture Builder</li>
              </ul>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleComplete} 
                disabled={completing}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {completing ? 'Completing...' : 'Complete Station'}
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Ready to begin your cloud adventure? Click to proceed to Station 2!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Station Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. First, find the QR code in the {station.location}</p>
            <p>2. Enter the QR code text to unlock the challenge</p>
            <p>3. Solve the riddle to discover your next destination</p>
            <p>4. Answer the AWS question to complete the station</p>
            <p>5. Earn your "{station.badge}" badge!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}