'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  Star, 
  Eye, 
  Calendar,
  CheckCircle,
  BookOpen,
  Target,
  Globe,
  Share2,
  Download,
  Heart,
  MessageCircle
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoCourse {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoType: 'youtube' | 'vimeo' | 'direct_upload' | 'embed_link';
  videoUrl: string;
  embedCode?: string;
  thumbnailUrl?: string;
  duration?: number;
  videoQuality?: string;
  fileSize?: number;
  instructor?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  isPublic: boolean;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  completionCount: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  publishDate?: string;
  metaDescription?: string;
}

interface VideoCourseDetailProps {
  courseId: string;
}

export default function VideoCourseDetail({ courseId }: VideoCourseDetailProps) {
  const router = useRouter();
  const [course, setCourse] = useState<VideoCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      

      const response = await fetch(`/api/video-courses/${courseId}`, {
        credentials: 'include'
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourse(data.data);
        } else {
          setError('Failed to load course');
        }
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Duration not specified';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.title,
          text: course?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const markAsCompleted = () => {
    setIsCompleted(!isCompleted);
    // TODO: Implement API call to track completion
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement API call to save favorites
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="bg-white dark:bg-secondary/60 rounded-lg shadow-sm p-6 mb-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-white dark:bg-secondary/60 rounded-lg shadow-sm overflow-hidden mb-6">
              <VideoPlayer
                videoType={course.videoType}
                videoUrl={course.videoUrl}
                embedCode={course.embedCode}
                thumbnailUrl={course.thumbnailUrl}
                title={course.title}
                className="aspect-video"
              />
            </div>

            {/* Course Info */}
            <div className="bg-white dark:bg-secondary/60 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {course.instructor && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {course.instructor}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(course.duration)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {course.viewCount} views
                    </div>
                    {course.averageRating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {course.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorited 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{course.description}</p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={markAsCompleted}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isCompleted
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isCompleted ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>

            {/* Learning Objectives */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div className="bg-white dark:bg-secondary/60 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  What You'll Learn
                </h2>
                <ul className="space-y-2">
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white dark:bg-secondary/60 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                  Prerequisites
                </h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-2 w-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-secondary/60 rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                  <p className="text-gray-900 dark:text-white">{course.category}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                  </span>
                </div>

                {course.tags && course.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</label>
                  <p className="text-gray-900 dark:text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(course.publishDate || course.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Views</label>
                  <p className="text-gray-900 dark:text-white flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    {course.viewCount.toLocaleString()}
                  </p>
                </div>

                {course.completionCount > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Completions</label>
                    <p className="text-gray-900 dark:text-white flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {course.completionCount.toLocaleString()}
                    </p>
                  </div>
                )}

                {course.videoQuality && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Video Quality</label>
                    <p className="text-gray-900 dark:text-white">{course.videoQuality}</p>
                  </div>
                )}

                {course.fileSize && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">File Size</label>
                    <p className="text-gray-900 dark:text-white">{(course.fileSize / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}