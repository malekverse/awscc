'use client';

import React, { useState, useEffect } from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoType: 'youtube' | 'vimeo' | 'direct_upload' | 'embed_link';
  videoUrl: string;
  embedCode?: string;
  thumbnailUrl?: string;
  title: string;
  className?: string;
}

export default function VideoPlayer({ 
  videoType, 
  videoUrl, 
  embedCode, 
  thumbnailUrl, 
  title,
  className = ""
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true); // Always show thumbnail initially
  const [imageError, setImageError] = useState(false);
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);

  // Initialize thumbnail URL
  useEffect(() => {
    let initialThumbnailUrl = thumbnailUrl;
    
    // If no custom thumbnail and it's a YouTube video, generate YouTube thumbnail
    if (!initialThumbnailUrl && videoType === 'youtube') {
      const youtubeId = getYouTubeVideoId(videoUrl);
      if (youtubeId) {
        // Use maxresdefault for best quality
        initialThumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    }
    
    setCurrentThumbnailUrl(initialThumbnailUrl || null);
    setImageError(false);
  }, [videoUrl, videoType, thumbnailUrl]);

  const handleImageError = () => {
    if (videoType === 'youtube') {
      const youtubeId = getYouTubeVideoId(videoUrl);
      if (youtubeId && currentThumbnailUrl) {
        // Try different YouTube thumbnail qualities in order
        if (currentThumbnailUrl.includes('maxresdefault.jpg')) {
          setCurrentThumbnailUrl(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
        } else if (currentThumbnailUrl.includes('hqdefault.jpg')) {
          setCurrentThumbnailUrl(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`);
        } else if (currentThumbnailUrl.includes('mqdefault.jpg')) {
          setCurrentThumbnailUrl(`https://img.youtube.com/vi/${youtubeId}/default.jpg`);
        } else {
          // Final fallback - set to null to show gradient background
          setCurrentThumbnailUrl(null);
          setImageError(true);
        }
      }
    } else {
      setImageError(true);
    }
  };

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/user\/[^\/]+#p\/[a-z]\/[0-9]+\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Extract Vimeo video ID
  const getVimeoVideoId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i);
    return match ? match[1] : null;
  };

  const handlePlay = () => {
    setShowThumbnail(false);
    setIsPlaying(true);
  };

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-500 min-h-[300px]">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p className="text-lg font-medium">Unable to load video</p>
      <p className="text-sm text-center">Please check the video URL or try again later</p>
    </div>
  );

  const renderThumbnail = (playButtonColor = "bg-purple-600") => {
    return (
      <div className="relative cursor-pointer group min-h-[300px] bg-gradient-to-br from-purple-900 to-blue-900" onClick={handlePlay}>
        {currentThumbnailUrl ? (
          <img 
            src={currentThumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : null}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center transition-all">
          <div className={`${playButtonColor} rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg`}>
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>
      </div>
    );
  };

  const renderVideoContent = () => {
    if (hasError) {
      return renderErrorState();
    }

    switch (videoType) {
      case 'youtube': {
        const youtubeId = getYouTubeVideoId(videoUrl);
        
        if (!youtubeId) {
          return renderErrorState();
        }

        // Show thumbnail if available and not playing
         if (showThumbnail && !isPlaying) {
           return renderThumbnail("bg-purple-600");
         }

        // Render YouTube iframe
        return (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full min-h-[300px]"
            onError={() => setHasError(true)}
          />
        );
      }

      case 'vimeo': {
        const vimeoId = getVimeoVideoId(videoUrl);
        
        if (!vimeoId) {
          return renderErrorState();
        }

        // Show thumbnail if available and not playing
         if (showThumbnail && !isPlaying) {
           return renderThumbnail("bg-purple-600");
         }

        // Render Vimeo iframe
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${isPlaying ? 1 : 0}`}
            title={title}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full min-h-[300px]"
            onError={() => setHasError(true)}
          />
        );
      }

      case 'direct_upload': {
        if (!videoUrl) {
          return renderErrorState();
        }

        // Show thumbnail if available and not playing
         if (showThumbnail && !isPlaying) {
           return renderThumbnail("bg-purple-600");
         }

        // Render video element
        return (
          <video
            src={videoUrl}
            title={title}
            controls
            autoPlay={isPlaying}
            className="w-full h-full min-h-[300px]"
            onError={() => setHasError(true)}
          >
            Your browser does not support the video tag.
          </video>
        );
      }

      case 'embed_link': {
        // If embedCode is provided, use it
        if (embedCode) {
          return (
            <div 
              className="w-full h-full min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: embedCode }}
            />
          );
        }

        // Fallback to iframe with videoUrl
        if (videoUrl) {
          return (
            <iframe
              src={videoUrl}
              title={title}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full min-h-[300px]"
              onError={() => setHasError(true)}
            />
          );
        }

        return renderErrorState();
      }

      default:
        return renderErrorState();
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full">
        {renderVideoContent()}
      </div>
    </div>
  );
}