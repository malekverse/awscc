'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, X, MapPin, Zap } from 'lucide-react';

interface Station3Props {
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

interface QRStep {
  id: number;
  code: string;
  hint: string;
  found: boolean;
}

export default function Station3({ onComplete, completing, qrValidated, onQRValidate, station }: Station3Props) {
  const [qrInput, setQrInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const [qrSteps] = useState<QRStep[]>([
    { id: 1, code: 'AWS', hint: 'Find the word "AWS"', found: false },
    { id: 2, code: 'CLOUD', hint: 'Find the word "Cloud"', found: false },
    { id: 3, code: 'CLUBS', hint: 'Find the word "Clubs"', found: false },
    { id: 4, code: 'ARE', hint: 'Find the word "Are"', found: false },
    { id: 5, code: 'AWESOME', hint: 'Find the word "Awesome"', found: false }
  ]);

  const [steps, setSteps] = useState(qrSteps);

  // Wrong answer codes that trigger animations
  const wrongCodes = [
    'WRONG_PATH_1', 'WRONG_PATH_2', 'WRONG_PATH_3', 'DEAD_END', 
    'TRAP_CODE', 'FAKE_QR', 'DECOY_1', 'DECOY_2'
  ];

  const handleQRSubmit = async () => {
    if (!qrValidated) {
      const success = await onQRValidate(qrInput);
      if (success) {
        setQrInput('');
      }
      return;
    }

    // Handle word-finding QR codes
    const inputCode = qrInput.trim().toUpperCase();
    
    // Check if it's a wrong code
    if (wrongCodes.includes(inputCode)) {
      triggerWrongAnswer();
      return;
    }

    // Check if it's one of the target words
    const targetStep = steps.find(step => step.code === inputCode && !step.found);
    if (targetStep) {
      const newSteps = [...steps];
      const stepIndex = newSteps.findIndex(step => step.id === targetStep.id);
      newSteps[stepIndex].found = true;
      setSteps(newSteps);
      setQrInput('');
      setAttempts(0);
      
      // Update current step to show progress
      const foundCount = newSteps.filter(step => step.found).length;
      setCurrentStep(foundCount);
      
      // Check if all words are found
      if (newSteps.every(step => step.found)) {
        onComplete('phrase-completed');
      }
    } else if (steps.find(step => step.code === inputCode && step.found)) {
      // Word already found
      setQrInput('');
      // Don't trigger wrong answer, just clear input
    } else {
      triggerWrongAnswer();
    }
  };

  const triggerWrongAnswer = () => {
    setWrongAnswer(true);
    setShakeAnimation(true);
    setAttempts(attempts + 1);
    setQrInput('');
    
    setTimeout(() => {
      setWrongAnswer(false);
      setShakeAnimation(false);
    }, 2000);
  };

  const resetMaze = () => {
    setSteps(qrSteps);
    setCurrentStep(0);
    setAttempts(0);
    setWrongAnswer(false);
    setQrInput('');
  };

  const getProgressPercentage = () => {
    return (currentStep / steps.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* QR Code Validation */}
      {!qrValidated && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <QrCode className="h-5 w-5 mr-2" />
              Step 1: Find and Scan the Entry QR Code
            </CardTitle>
            <CardDescription className="text-orange-700">
              Look around the {station.location} for a QR code.
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
              💡 Hint: Look for QR codes around the corridor area
            </p>
          </CardContent>
        </Card>
      )}

      {/* Maze Challenge */}
      {qrValidated && (
        <>
          {/* Wrong Answer Animation */}
          {wrongAnswer && (
            <Alert className={`border-red-500 bg-red-50 ${shakeAnimation ? 'animate-pulse' : ''}`}>
              <X className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-red-600" />
                  Wrong word! That's not one of the target words. Try again!
                </div>
                {attempts > 2 && (
                  <p className="mt-2 text-sm">
                  💡 Hint: Look for QR codes containing words that form a phrase about AWS Cloud Clubs
                </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Word Finding Challenge
              </CardTitle>
              <CardDescription>
                Find and scan QR codes containing specific words to form the phrase "AWS Cloud Clubs are awesome"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  🔍 Find the Words
                </h3>
                <p className="text-purple-700">
                  Find and scan 5 QR codes containing specific words to form a phrase about AWS Cloud Clubs. 
                  You can find them in any order! Be careful - there are decoy codes that will lead you astray!
                </p>
                <p className="text-purple-600 mt-2 font-medium">
                  Discover the words to reveal the complete phrase!
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{currentStep} / {steps.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* QR Input */}
              {currentStep < steps.length && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Find Words ({currentStep} / {steps.length} found)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-700 mb-4">
                      Scan QR codes around the area to find words that form a phrase about AWS Cloud Clubs
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="Enter the QR code text"
                        className="flex-1"
                      />
                      <Button onClick={handleQRSubmit} disabled={!qrInput.trim()}>
                        Scan QR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Found Words */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Found Words:</h4>
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-center p-3 rounded-lg ${
                      step.found 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                      step.found 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.found ? '✓' : '?'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.found ? 'text-green-800' : 'text-gray-600'}`}>
                        {step.found ? step.code : `Word ${index + 1}`}
                      </p>
                      {step.found && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Found!
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Challenge Complete */}
              {currentStep === steps.length && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Phrase Completed! 🎉
                      </h3>
                      <p className="text-green-700 mb-2">
                        Congratulations! You've found all the words to form:
                      </p>
                      <p className="text-xl font-bold text-green-800">
                        "AWS Cloud Clubs are awesome"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Controls */}
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={resetMaze}
                  variant="outline"
                  disabled={completing}
                >
                  Reset Maze
                </Button>
              </div>

              {/* Stats */}
              <div className="text-center text-sm text-gray-600">
                <p>Wrong attempts: {attempts}</p>
                {attempts > 0 && (
                  <p className="text-xs mt-1">
                    💡 Remember: Follow the hints and avoid decoy QR codes!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Station Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Find and scan the entry QR code to start the maze</p>
            <p>2. Follow the hints to find 5 QR codes in the correct sequence</p>
            <p>3. Avoid decoy QR codes that will trigger wrong answer animations</p>
            <p>4. Complete all 5 steps to finish the maze</p>
            <p>5. Earn your "{station.badge}" badge!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}