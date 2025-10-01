'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, RotateCcw } from 'lucide-react';

interface Station2Props {
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

interface ServiceMatch {
  service: string;
  description: string;
  matched: boolean;
}

export default function Station2({ onComplete, completing, qrValidated, onQRValidate, station }: Station2Props) {
  const [qrInput, setQrInput] = useState('');
  const [draggedService, setDraggedService] = useState<string | null>(null);
  
  const [services] = useState([
    'Amazon S3',
    'AWS Lambda',
    'Amazon EC2',
    'Amazon RDS',
    'Amazon CloudFront'
  ]);

  const [descriptions, setDescriptions] = useState<ServiceMatch[]>([
    { service: '', description: 'Object storage service for storing and retrieving any amount of data', matched: false },
    { service: '', description: 'Serverless compute service that runs code without managing servers', matched: false },
    { service: '', description: 'Virtual servers in the cloud for running applications', matched: false },
    { service: '', description: 'Managed relational database service', matched: false },
    { service: '', description: 'Content delivery network for fast content distribution', matched: false }
  ]);

  const correctMatches = {
    'Amazon S3': 'Object storage service for storing and retrieving any amount of data',
    'AWS Lambda': 'Serverless compute service that runs code without managing servers',
    'Amazon EC2': 'Virtual servers in the cloud for running applications',
    'Amazon RDS': 'Managed relational database service',
    'Amazon CloudFront': 'Content delivery network for fast content distribution'
  };

  const handleQRSubmit = async () => {
    const success = await onQRValidate(qrInput);
    if (success) {
      setQrInput('');
    }
  };

  const handleDragStart = (service: string) => {
    setDraggedService(service);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedService) return;

    const newDescriptions = [...descriptions];
    
    // Remove service from any previous match
    newDescriptions.forEach(desc => {
      if (desc.service === draggedService) {
        desc.service = '';
        desc.matched = false;
      }
    });

    // Add service to new position
    newDescriptions[index].service = draggedService;
    newDescriptions[index].matched = correctMatches[draggedService as keyof typeof correctMatches] === newDescriptions[index].description;
    
    setDescriptions(newDescriptions);
    setDraggedService(null);
  };

  const resetPuzzle = () => {
    setDescriptions(descriptions.map(desc => ({ ...desc, service: '', matched: false })));
  };

  const checkCompletion = () => {
    const allMatched = descriptions.every(desc => desc.matched && desc.service !== '');
    if (allMatched) {
      onComplete('aws-services-matched');
    } else {
      alert('Not all services are correctly matched. Keep trying!');
    }
  };

  const getAvailableServices = () => {
    const usedServices = descriptions.map(desc => desc.service).filter(service => service !== '');
    return services.filter(service => !usedServices.includes(service));
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
              💡 Hint: Look for signs about AWS Builders or development resources
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
              AWS Service Matching Challenge
            </CardTitle>
            <CardDescription>
              Drag and drop AWS services to match them with their correct descriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📚 Test Your AWS Knowledge
              </h3>
              <p className="text-blue-700">
                Match each AWS service with its correct description. Drag the service names from the left 
                and drop them onto the matching descriptions on the right.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Services */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">AWS Services</h4>
                <div className="space-y-3">
                  {getAvailableServices().map((service) => (
                    <div
                      key={service}
                      draggable
                      onDragStart={() => handleDragStart(service)}
                      className="bg-blue-100 border border-blue-300 rounded-lg p-4 cursor-move hover:bg-blue-200 transition-colors"
                    >
                      <span className="font-medium text-blue-800">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Service Descriptions</h4>
                <div className="space-y-3">
                  {descriptions.map((desc, index) => (
                    <div
                      key={index}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`border-2 border-dashed rounded-lg p-4 min-h-[80px] transition-colors ${
                        desc.service === '' 
                          ? 'border-gray-300 bg-gray-50' 
                          : desc.matched 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-red-300 bg-red-50'
                      }`}
                    >
                      {desc.service && (
                        <div className={`font-medium mb-2 ${desc.matched ? 'text-green-800' : 'text-red-800'}`}>
                          {desc.service}
                          {desc.matched && <CheckCircle className="inline h-4 w-4 ml-2" />}
                        </div>
                      )}
                      <p className="text-sm text-gray-700">{desc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button 
                onClick={resetPuzzle}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={checkCompletion}
                disabled={completing || descriptions.some(desc => desc.service === '')}
              >
                {completing ? 'Completing...' : 'Check Answers'}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Matched: {descriptions.filter(desc => desc.matched).length} / {descriptions.length}
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
            <p>1. Find and scan the QR code in the {station.location}</p>
            <p>2. Drag AWS service names to their matching descriptions</p>
            <p>3. Green boxes indicate correct matches, red boxes indicate incorrect matches</p>
            <p>4. Match all services correctly to complete the station</p>
            <p>5. Earn your "{station.badge}" badge!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}