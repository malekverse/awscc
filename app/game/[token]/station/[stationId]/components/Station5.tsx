'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, Trophy, Puzzle, Award } from 'lucide-react';

interface Station5Props {
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

interface ArchitectureComponent {
  id: string;
  name: string;
  description: string;
  position: number;
  placed: boolean;
}

export default function Station5({ onComplete, completing, qrValidated, onQRValidate, station }: Station5Props) {
  const [qrInput, setQrInput] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [showArchitecture, setShowArchitecture] = useState(false);
  
  const [components] = useState<ArchitectureComponent[]>([
    { id: 'route53', name: 'Route 53', description: 'DNS and domain registration', position: 0, placed: false },
    { id: 'cloudfront', name: 'CloudFront', description: 'Content delivery network', position: 0, placed: false },
    { id: 'alb', name: 'Application Load Balancer', description: 'Distributes incoming traffic', position: 0, placed: false },
    { id: 'ec2', name: 'EC2 Instances', description: 'Virtual servers', position: 0, placed: false },
    { id: 'rds', name: 'RDS Database', description: 'Managed relational database', position: 0, placed: false },
    { id: 's3', name: 'S3 Bucket', description: 'Object storage', position: 0, placed: false }
  ]);

  const [architectureSlots] = useState([
    { id: 1, label: 'User Request Entry Point', hint: 'Where users first connect to your application' },
    { id: 2, label: 'Global Content Delivery', hint: 'Speeds up content delivery worldwide' },
    { id: 3, label: 'Traffic Distribution', hint: 'Distributes requests across multiple servers' },
    { id: 4, label: 'Application Processing', hint: 'Where your application code runs' },
    { id: 5, label: 'Data Storage', hint: 'Where your application data is stored' },
    { id: 6, label: 'Static Asset Storage', hint: 'Where images, CSS, and JS files are stored' }
  ]);

  const [placedComponents, setPlacedComponents] = useState<{[key: number]: ArchitectureComponent | null}>({
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null
  });

  const correctOrder = {
    1: 'route53',
    2: 'cloudfront', 
    3: 'alb',
    4: 'ec2',
    5: 'rds',
    6: 's3'
  };

  const handleQRSubmit = async () => {
    const success = await onQRValidate(qrInput);
    if (success) {
      setQrInput('');
    }
  };

  const handleDragStart = (componentId: string) => {
    setDraggedComponent(componentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    if (!draggedComponent) return;

    const component = components.find(c => c.id === draggedComponent);
    if (!component) return;

    // Remove component from any previous slot
    const newPlacedComponents = { ...placedComponents };
    Object.keys(newPlacedComponents).forEach(key => {
      if (newPlacedComponents[parseInt(key)]?.id === draggedComponent) {
        newPlacedComponents[parseInt(key)] = null;
      }
    });

    // Place component in new slot
    newPlacedComponents[slotId] = component;
    setPlacedComponents(newPlacedComponents);
    setDraggedComponent(null);
  };

  const checkArchitecture = () => {
    let correct = 0;
    let total = Object.keys(correctOrder).length;

    Object.entries(correctOrder).forEach(([slot, componentId]) => {
      if (placedComponents[parseInt(slot)]?.id === componentId) {
        correct++;
      }
    });

    if (correct === total) {
      setShowArchitecture(true);
      // Don't complete yet - need final answer
    } else {
      alert(`You got ${correct} out of ${total} components in the correct position. Keep trying!`);
    }
  };

  const submitFinalAnswer = () => {
    const answer = finalAnswer.trim();
    const correctAnswer = 'AWS Builders Build Free with Lambda and S3';
    
    if (answer === correctAnswer) {
      onComplete('AWS Builders Build Free with Lambda and S3');
    } else {
      alert('Not quite right. Look for the exact phrase that celebrates AWS Builders and mentions Lambda and S3...');
    }
  };

  const resetArchitecture = () => {
    setPlacedComponents({1: null, 2: null, 3: null, 4: null, 5: null, 6: null});
    setShowArchitecture(false);
    setFinalAnswer('');
  };

  const getAvailableComponents = () => {
    const placedIds = Object.values(placedComponents).map(c => c?.id).filter(Boolean);
    return components.filter(c => !placedIds.includes(c.id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* QR Code Validation */}
      {!qrValidated && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <QrCode className="h-5 w-5 mr-2" />
              Step 1: Find and Scan the QR Code
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
              💡 Hint: Look for the AWS architecture diagram or poster
            </p>
          </CardContent>
        </Card>
      )}

      {/* Architecture Challenge */}
      {qrValidated && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                AWS Architecture Challenge
              </CardTitle>
              <CardDescription>
                Build a well-architected AWS solution by placing components in the correct order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                  <Puzzle className="h-5 w-5 mr-2" />
                  🏗️ Design a Web Application Architecture
                </h3>
                <p className="text-blue-700">
                  Drag and drop AWS services to create a typical 3-tier web application architecture. 
                  Think about the flow from user request to data storage.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Components */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Available AWS Services</h4>
                  <div className="space-y-3">
                    {getAvailableComponents().map((component) => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={() => handleDragStart(component.id)}
                        className="bg-blue-100 border border-blue-300 rounded-lg p-4 cursor-move hover:bg-blue-200 transition-colors"
                      >
                        <div className="font-medium text-blue-800">{component.name}</div>
                        <div className="text-sm text-blue-600">{component.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture Slots */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Architecture Flow</h4>
                  <div className="space-y-3">
                    {architectureSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={`border-2 border-dashed rounded-lg p-4 min-h-[80px] transition-colors ${
                          placedComponents[slot.id] 
                            ? placedComponents[slot.id]?.id === correctOrder[slot.id as keyof typeof correctOrder]
                              ? 'border-green-300 bg-green-50' 
                              : 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-gray-800 mb-1">
                          {slot.id}. {slot.label}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{slot.hint}</div>
                        {placedComponents[slot.id] && (
                          <div className={`font-medium ${
                            placedComponents[slot.id]?.id === correctOrder[slot.id as keyof typeof correctOrder]
                              ? 'text-green-800' 
                              : 'text-yellow-800'
                          }`}>
                            {placedComponents[slot.id]?.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={resetArchitecture}
                  variant="outline"
                  disabled={completing}
                >
                  Reset
                </Button>
                <Button 
                  onClick={checkArchitecture}
                  disabled={completing || Object.values(placedComponents).some(c => c === null)}
                >
                  Check Architecture
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Final Question */}
          {showArchitecture && (
            <Card className="border-gold-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <Trophy className="h-5 w-5 mr-2" />
                  Final Challenge Question
                </CardTitle>
                <CardDescription className="text-orange-700">
                  You've built a great architecture! Now answer this final question to complete the game.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    🎯 Final Question:
                  </h4>
                  <p className="text-orange-700">
                    Complete this phrase that celebrates the AWS community and highlights two key services: 
                    "AWS Builders Build Free with _____ and _____"
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={finalAnswer}
                    onChange={(e) => setFinalAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={submitFinalAnswer}
                    disabled={completing || !finalAnswer.trim()}
                  >
                    {completing ? 'Completing...' : 'Submit Answer'}
                  </Button>
                </div>

                <p className="text-sm text-orange-600">
                  💡 Hint: Think about serverless computing and object storage - two fundamental AWS services
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Station Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Find and scan the QR code in the {station.location}</p>
            <p>2. Drag AWS services to build a web application architecture</p>
            <p>3. Place components in the correct order from user request to data storage</p>
            <p>4. Check your architecture when all slots are filled</p>
            <p>5. Answer the final question about AWS best practices</p>
            <p>6. Earn your "{station.badge}" badge and complete the game!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}