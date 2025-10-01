'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Download, Share2, Calendar, Clock, Award, Star } from 'lucide-react';

interface GameSession {
  _id: string;
  playerName: string;
  email: string;
  gameToken: string;
  startTime: string;
  endTime: string;
  completionTime: number;
  badges: string[];
  stationsCompleted: number[];
  isCompleted: boolean;
}

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCertificateData();
  }, [certificateId]);

  const fetchCertificateData = async () => {
    try {
      const response = await fetch(`/api/game/certificate/${certificateId}`);
      if (!response.ok) {
        throw new Error('Certificate not found');
      }
      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current || !session) {
      console.error('Certificate ref or session not available');
      alert('Certificate not ready for download. Please try again.');
      return;
    }
    
    setDownloading(true);
    try {
      console.log('Starting certificate download...');
      
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      console.log('html2canvas imported successfully');
      
      // Wait a moment for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Capturing certificate element...');
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight
      });
      
      console.log('Canvas created successfully, size:', canvas.width, 'x', canvas.height);
      
      // Create download link
      const link = document.createElement('a');
      const fileName = `cloud-conquest-certificate-${session.playerName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Certificate downloaded successfully as:', fileName);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      
      // Fallback: offer print option
      const shouldPrint = confirm(`Failed to download certificate: ${err instanceof Error ? err.message : 'Unknown error'}.\n\nWould you like to print the certificate instead?`);
      if (shouldPrint) {
        window.print();
      }
    } finally {
      setDownloading(false);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  const shareCertificate = async () => {
    if (!session) return;
    
    const shareData = {
      title: 'Cloud Conquest Certificate',
      text: `I just completed the AWS Cloud Conquest scavenger hunt in ${session.completionTime} minutes! 🏆`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        alert('Certificate URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing certificate:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBadgeEmoji = (badge: string) => {
    const badgeMap: { [key: string]: string } = {
      'Explorer': '🧭',
      'AWS Scholar': '📚',
      'Navigator': '🗺️',
      'Detective': '🔍',
      'Architect': '🏗️'
    };
    return badgeMap[badge] || '🏆';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#4b5563' }}>Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle style={{ color: '#dc2626' }}>Certificate Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
              <AlertDescription style={{ color: '#991b1b' }}>
                {error || 'This certificate does not exist or has been removed.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #faf5ff)', padding: '16px' }}>
         <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
           <div style={{ textAlign: 'center' }} className="no-print">
             <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
               🎉 Congratulations! 🎉
             </h1>
             <p style={{ color: '#4b5563' }}>
               You have successfully completed the AWS Cloud Conquest scavenger hunt!
             </p>
           </div>

         {/* Certificate */}
         <div 
           ref={certificateRef}
           style={{ 
             margin: '0 auto',
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             padding: '8px',
             borderRadius: '12px',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
           }}
           className="certificate-container"
         >
           <div 
             style={{ 
               backgroundColor: '#ffffff',
               borderRadius: '8px',
               padding: '48px',
               textAlign: 'center'
             }}
           >
             {/* Certificate Header */}
             <div style={{ marginBottom: '32px' }}>
               <div style={{ fontSize: '60px', marginBottom: '16px' }}>🏆</div>
               <h2 
                 style={{ 
                   fontSize: '36px', 
                   fontWeight: 'bold', 
                   marginBottom: '8px',
                   color: '#1f2937' 
                 }}
               >
                 Certificate of Achievement
               </h2>
               <div 
                 style={{ 
                   width: '128px',
                   height: '4px',
                   margin: '0 auto',
                   borderRadius: '2px',
                   background: 'linear-gradient(to right, #60a5fa, #a78bfa)' 
                 }}
               ></div>
             </div>

             {/* Award Text */}
             <div style={{ marginBottom: '32px' }}>
               <p 
                 style={{ 
                   fontSize: '18px', 
                   marginBottom: '16px',
                   color: '#4b5563' 
                 }}
               >
                 This certifies that
               </p>
               <h3 
                 style={{ 
                   fontSize: '30px', 
                   fontWeight: 'bold', 
                   marginBottom: '16px',
                   color: '#1f2937' 
                 }}
               >
                 {session.playerName}
               </h3>
               <p 
                 style={{ 
                   fontSize: '18px', 
                   marginBottom: '8px',
                   color: '#4b5563' 
                 }}
               >
                 has successfully completed the
               </p>
               <h4 
                 style={{ 
                   fontSize: '24px', 
                   fontWeight: '600', 
                   marginBottom: '16px',
                   color: '#2563eb' 
                 }}
               >
                 AWS Cloud Conquest Scavenger Hunt
               </h4>
             </div>

             {/* Achievement Details */}
             <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
               gap: '24px', 
               marginBottom: '32px' 
             }}>
               <div style={{ textAlign: 'center' }}>
                 <Clock 
                   style={{ 
                     height: '32px', 
                     width: '32px', 
                     margin: '0 auto 8px',
                     color: '#3b82f6' 
                   }}
                 />
                 <p 
                   style={{ 
                     fontSize: '14px', 
                     marginBottom: '4px',
                     color: '#4b5563' 
                   }}
                 >
                   Completion Time
                 </p>
                 <p 
                   style={{ 
                     fontWeight: '600',
                     color: '#1f2937' 
                   }}
                 >
                   {session.completionTime} minutes
                 </p>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <Award 
                   style={{ 
                     height: '32px', 
                     width: '32px', 
                     margin: '0 auto 8px',
                     color: '#8b5cf6' 
                   }}
                 />
                 <p 
                   style={{ 
                     fontSize: '14px', 
                     marginBottom: '4px',
                     color: '#4b5563' 
                   }}
                 >
                   Stations Completed
                 </p>
                 <p 
                   style={{ 
                     fontWeight: '600',
                     color: '#1f2937' 
                   }}
                 >
                   {session.stationsCompleted.length} / 5
                 </p>
               </div>
               <div style={{ textAlign: 'center' }}>
                 <Star 
                   style={{ 
                     height: '32px', 
                     width: '32px', 
                     margin: '0 auto 8px',
                     color: '#eab308' 
                   }}
                 />
                 <p 
                   style={{ 
                     fontSize: '14px', 
                     marginBottom: '4px',
                     color: '#4b5563' 
                   }}
                 >
                   Badges Earned
                 </p>
                 <p 
                   style={{ 
                     fontWeight: '600',
                     color: '#1f2937' 
                   }}
                 >
                   {session.badges.length}
                 </p>
               </div>
             </div>

             {/* Badges */}
             <div style={{ marginBottom: '32px' }}>
               <h5 
                 style={{ 
                   fontSize: '18px', 
                   fontWeight: '600', 
                   marginBottom: '16px',
                   color: '#1f2937' 
                 }}
               >
                 Badges Earned
               </h5>
               <div style={{ 
                 display: 'flex', 
                 flexWrap: 'wrap', 
                 justifyContent: 'center', 
                 gap: '12px' 
               }}>
                 {session.badges.map((badge, index) => (
                   <div 
                     key={index}
                     style={{
                       padding: '8px 16px',
                       borderRadius: '9999px',
                       background: 'linear-gradient(to right, #dbeafe, #e9d5ff)',
                       border: '1px solid #93c5fd'
                     }}
                   >
                     <span style={{ fontSize: '18px', marginRight: '8px' }}>{getBadgeEmoji(badge)}</span>
                     <span 
                       style={{ 
                         fontWeight: '500',
                         color: '#1f2937' 
                       }}
                     >
                       {badge}
                     </span>
                   </div>
                 ))}
               </div>
             </div>

             {/* Date and Signature */}
             <div 
               style={{ 
                 paddingTop: '24px',
                 borderTop: '1px solid #e5e7eb' 
               }}
             >
               <div style={{ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center' 
               }}>
                 <div style={{ textAlign: 'left' }}>
                   <p 
                     style={{ 
                       fontSize: '14px',
                       color: '#4b5563' 
                     }}
                   >
                     Date of Completion
                   </p>
                   <p 
                     style={{ 
                       fontWeight: '600',
                       color: '#1f2937' 
                     }}
                   >
                     {formatDate(session.endTime)}
                   </p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <p 
                     style={{ 
                       fontSize: '14px',
                       color: '#4b5563' 
                     }}
                   >
                     AWS Cloud Club ISIMS
                   </p>
                   <p 
                     style={{ 
                       fontWeight: '600',
                       color: '#1f2937' 
                     }}
                   >
                     Scavenger Hunt Committee
                   </p>
                 </div>
               </div>
             </div>

             {/* Certificate ID */}
             <div style={{ marginTop: '24px', textAlign: 'center' }}>
               <p 
                 style={{ 
                   fontSize: '12px',
                   color: '#6b7280' 
                 }}
               >
                 Certificate ID: {certificateId}
               </p>
             </div>
           </div>
         </div>

         {/* Actions */}
         <div style={{ 
           display: 'flex', 
           flexDirection: 'column', 
           gap: '16px', 
           justifyContent: 'center',
           alignItems: 'center'
         }} className="no-print">
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
             <Button 
               onClick={downloadCertificate}
               disabled={downloading}
               style={{
                 backgroundColor: '#2563eb',
                 color: 'white',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 border: 'none',
                 cursor: downloading ? 'not-allowed' : 'pointer',
                 opacity: downloading ? 0.6 : 1,
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               <Download style={{ height: '16px', width: '16px' }} />
               {downloading ? 'Downloading...' : 'Download Certificate'}
             </Button>
             <Button 
               onClick={printCertificate}
               style={{
                 backgroundColor: 'transparent',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 border: '1px solid #16a34a',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
               </svg>
               Print Certificate
             </Button>
             <Button 
               onClick={shareCertificate}
               style={{
                 backgroundColor: 'transparent',
                 padding: '8px 16px',
                 borderRadius: '6px',
                 border: '1px solid #2563eb',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}
             >
               <Share2 style={{ height: '16px', width: '16px' }} />
               Share Achievement
             </Button>
           </div>
         </div>

         {/* Additional Info */}
         <Card style={{ maxWidth: '512px', margin: '0 auto' }} className="no-print">
           <CardHeader>
             <CardTitle style={{ display: 'flex', alignItems: 'center' }}>
               <Trophy style={{ height: '20px', width: '20px', marginRight: '8px', color: '#eab308' }} />
               What's Next?
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4b5563' }}>
               <p>🎯 Join our AWS Cloud Club community to continue your cloud journey</p>
               <p>📚 Explore AWS certification paths and study resources</p>
               <p>🤝 Connect with fellow cloud enthusiasts and professionals</p>
               <p>🚀 Participate in upcoming workshops and events</p>
             </div>
           </CardContent>
         </Card>
         </div>
       </div>
     </>
   );
}