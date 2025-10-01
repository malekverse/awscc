'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, Eye, Coffee, Utensils } from 'lucide-react';

interface Station4Props {
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

interface MenuItem {
  id: number;
  name: string;
  price: string;
  description: string;
  isClue: boolean;
  found: boolean;
  awsService?: string;
  isTarget?: boolean;
}

export default function Station4({ onComplete, completing, qrValidated, onQRValidate, station }: Station4Props) {
  const [qrInput, setQrInput] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  
  const [menuItems] = useState<MenuItem[]>([
    // Regular menu items
    { id: 1, name: 'Classic Burger', price: '$8.99', description: 'Beef patty with lettuce, tomato, and cheese', isClue: false, found: false },
    { id: 2, name: 'Caesar Salad', price: '$6.50', description: 'Fresh romaine with parmesan and croutons', isClue: false, found: false },
    { id: 3, name: 'Margherita Pizza', price: '$12.99', description: 'Fresh mozzarella, basil, and tomato sauce', isClue: false, found: false },
    { id: 4, name: 'Fish Tacos', price: '$9.99', description: 'Grilled fish with cabbage slaw and lime', isClue: false, found: false },
    { id: 5, name: 'Chicken Wings', price: '$7.99', description: 'Buffalo style with celery and ranch', isClue: false, found: false },
    { id: 6, name: 'Pasta Primavera', price: '$11.99', description: 'Fresh vegetables with penne pasta', isClue: false, found: false },
    { id: 7, name: 'Grilled Salmon', price: '$15.99', description: 'Atlantic salmon with lemon and herbs', isClue: false, found: false },
    { id: 8, name: 'Chocolate Cake', price: '$4.99', description: 'Rich chocolate layer cake with frosting', isClue: false, found: false },
    { id: 9, name: 'Garden Salad', price: '$5.99', description: 'Mixed greens with your choice of dressing', isClue: false, found: false },
    
    // The special AWS Lambda Burger (the key item to find)
    { id: 10, name: 'Lambda Burger', price: '$10.99', description: 'Serverless burger that scales automatically with your appetite', isClue: true, found: false, awsService: 'AWS Lambda', isTarget: true },
    
    // Other AWS-themed items (distractors)
    { id: 11, name: 'S3 Bucket Fries', price: '$4.99', description: 'Crispy fries served in a storage container', isClue: true, found: false, awsService: 'Amazon S3' },
    { id: 12, name: 'EC2 Instance Coffee', price: '$3.99', description: 'Virtual blend of premium beans, scalable size', isClue: true, found: false, awsService: 'Amazon EC2' },
    { id: 13, name: 'RDS Relational Soup', price: '$4.99', description: 'Managed database of vegetables and broth', isClue: true, found: false, awsService: 'Amazon RDS' },
    { id: 14, name: 'CloudFront Delivery Pizza', price: '$13.99', description: 'Fast delivery from our global kitchen network', isClue: true, found: false, awsService: 'Amazon CloudFront' },
    { id: 15, name: 'IAM Identity Sandwich', price: '$7.99', description: 'Access-controlled layers with permission-based toppings', isClue: true, found: false, awsService: 'AWS IAM' },
  ]);

  const [items, setItems] = useState(menuItems);

  const handleQRSubmit = async () => {
    const success = await onQRValidate(qrInput);
    if (success) {
      setQrInput('');
    }
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const checkAnswers = () => {
    const lambdaBurger = items.find(item => item.name === 'Lambda Burger');
    const isLambdaBurgerSelected = selectedItems.includes(lambdaBurger?.id || 0);
    const selectedNonClueItems = selectedItems.filter(id => 
      !items.find(item => item.id === id)?.isClue
    );

    // Check if the Lambda Burger is selected and no non-clue items are selected
    if (isLambdaBurgerSelected && selectedNonClueItems.length === 0) {
      // Mark the Lambda Burger as found
      const newItems = items.map(item => ({
        ...item,
        found: item.name === 'Lambda Burger'
      }));
      setItems(newItems);
      
      // Complete the station with the expected answer
      onComplete('lambda-burger-found');
    } else {
      // Show feedback
      let message = '';
      if (selectedNonClueItems.length > 0) {
        message = `You selected ${selectedNonClueItems.length} regular menu item(s). Look for the special AWS Lambda item!`;
      } else if (!isLambdaBurgerSelected) {
        message = `You need to find the Lambda Burger! Look for the special AWS Lambda item on the menu.`;
      }
      alert(message);
    }
  };

  const resetSelection = () => {
    setSelectedItems([]);
    setItems(menuItems);
  };

  const getClueCount = () => {
    return items.filter(item => item.isClue).length;
  };

  const getFoundCount = () => {
    return selectedItems.filter(id => 
      items.find(item => item.id === id)?.isClue
    ).length;
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
              💡 Hint: Look for the menu board or ordering station
            </p>
          </CardContent>
        </Card>
      )}

      {/* Spot the Clue Challenge */}
      {qrValidated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Spot the AWS Clues Challenge
            </CardTitle>
            <CardDescription>
              Find all the AWS-themed menu items hidden among the regular cafeteria offerings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                <Utensils className="h-5 w-5 mr-2" />
                🍽️ Cloud Cafeteria Menu
              </h3>
              <p className="text-green-700">
                Some creative chef has hidden AWS service names in the menu! 
                Can you spot all {getClueCount()} AWS-themed items?
              </p>
            </div>

            {/* Progress */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Found: {getFoundCount()} / {getClueCount()} AWS items
                </span>
              </div>
              <Button 
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
              >
                {showHint ? 'Hide' : 'Show'} Hint
              </Button>
            </div>

            {/* Hint */}
            {showHint && (
              <Alert className="border-blue-200 bg-blue-50">
                <Coffee className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  💡 Look for menu items that reference AWS services like S3, Lambda, EC2, RDS, CloudFront, and IAM. 
                  The descriptions might give you additional clues!
                </AlertDescription>
              </Alert>
            )}

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card 
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItems.includes(item.id)
                      ? item.isClue 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${item.found ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold ${
                        item.found ? 'text-green-800' : 
                        selectedItems.includes(item.id) 
                          ? item.isClue ? 'text-green-700' : 'text-red-700'
                          : 'text-gray-800'
                      }`}>
                        {item.name}
                      </h4>
                      <span className={`font-bold ${
                        item.found ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {item.price}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      item.found ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                    {item.found && item.awsService && (
                      <div className="mt-2 text-xs text-green-700 font-medium">
                        ✅ AWS Service: {item.awsService}
                      </div>
                    )}
                    {selectedItems.includes(item.id) && (
                      <div className={`mt-2 text-xs font-medium ${
                        item.isClue ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.isClue ? '✅ Correct!' : '❌ Not an AWS item'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={resetSelection}
                variant="outline"
                disabled={completing}
              >
                Reset Selection
              </Button>
              <Button 
                onClick={checkAnswers}
                disabled={completing || selectedItems.length === 0}
              >
                {completing ? 'Completing...' : 'Check Answers'}
              </Button>
            </div>

            {/* Selection Summary */}
            {selectedItems.length > 0 && (
              <div className="text-center text-sm text-gray-600">
                <p>Selected {selectedItems.length} items</p>
                <p className="text-xs mt-1">
                  Click items to select/deselect them
                </p>
              </div>
            )}
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
            <p>2. Look through the cafeteria menu for the special Lambda Burger</p>
            <p>3. Click on menu items to select them</p>
            <p>4. Find the AWS Lambda-themed burger item</p>
            <p>5. Avoid selecting regular menu items</p>
            <p>6. Earn your "{station.badge}" badge!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}