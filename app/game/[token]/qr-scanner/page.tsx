'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, QrCode, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function QRScannerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [qrCode, setQrCode] = useState('');
  const [stationNumber, setStationNumber] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    stationUnlocked?: number;
  } | null>(null);

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/game/session/${token}/validate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCode: qrCode.trim(),
          stationNumber: stationNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          stationUnlocked: data.stationUnlocked
        });
        toast.success(data.message);
        
        // Redirect to the unlocked station after a delay
        setTimeout(() => {
          router.push(`/game/${token}/station/${data.stationUnlocked}`);
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.message || data.error
        });
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      setResult({
        success: false,
        message: 'Failed to validate QR code. Please try again.'
      });
      toast.error('Failed to validate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stationInfo = {
    1: { name: 'Welcome Station', location: 'Cour (Courtyard)', qrHint: 'Look for the AWS logo' },
    2: { name: 'Knowledge Hub', location: 'Library', qrHint: 'Find the builders sign' },
    3: { name: 'Navigation Challenge', location: 'Corridor', qrHint: 'Search for the free tier poster' },
    4: { name: 'Discovery Zone', location: 'Cafeteria', qrHint: 'Look for the Lambda service menu' },
    5: { name: 'Final Challenge', location: 'Amphitheatre', qrHint: 'Find the S3 storage display' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Scanner
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          {/* QR Scanner Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Scan Station QR Code
              </CardTitle>
              <CardDescription>
                Enter the QR code you found at the station location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQRSubmit} className="space-y-4">
                <div>
                  <label htmlFor="station" className="block text-sm font-medium text-gray-700 mb-1">
                    Station Number
                  </label>
                  <select
                    id="station"
                    value={stationNumber}
                    onChange={(e) => setStationNumber(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(stationInfo).map(([num, info]) => (
                      <option key={num} value={num}>
                        Station {num} - {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="qrcode" className="block text-sm font-medium text-gray-700 mb-1">
                    QR Code
                  </label>
                  <Input
                    id="qrcode"
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Enter the QR code text"
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Validating...' : 'Validate QR Code'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Station Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Station {stationNumber} Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {stationInfo[stationNumber as keyof typeof stationInfo]?.name}</p>
                <p><strong>Location:</strong> {stationInfo[stationNumber as keyof typeof stationInfo]?.location}</p>
                <p><strong>Hint:</strong> {stationInfo[stationNumber as keyof typeof stationInfo]?.qrHint}</p>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Go to the physical location of the station</p>
                <p>2. Look for the QR code at that location</p>
                <p>3. Enter the text from the QR code above</p>
                <p>4. Select the correct station number</p>
                <p>5. Click "Validate QR Code" to unlock the station</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}