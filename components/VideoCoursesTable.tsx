'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Eye,
  Star,
  Clock,
  Users,
  Youtube,
  Video,
  ExternalLink,
  Upload
} from 'lucide-react';

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
  publishDate?: string;
  createdBy: string;
  lastModifiedBy?: string;
  viewCount: number;
  completionCount: number;
  averageRating?: number;
  slug?: string;
  metaDescription?: string;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

interface VideoCoursesTableProps {
  videoCourses: VideoCourse[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (difficulty: string) => void;
  videoTypeFilter: string;
  setVideoTypeFilter: (type: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  onCreateCourse: () => void;
  onEditCourse: (course: VideoCourse) => void;
  onDeleteCourse: (courseId: string) => void;
  onViewCourse: (course: VideoCourse) => void;
  formatDate: (date: string) => string;
  formatDuration: (seconds?: number) => string;
  formatFileSize: (bytes?: number) => string;
}

const getVideoTypeIcon = (type: string) => {
  switch (type) {
    case 'youtube': return Youtube;
    case 'vimeo': return Video;
    case 'direct_upload': return Upload;
    case 'embed_link': return ExternalLink;
    default: return Video;
  }
};

const getVideoTypeColor = (type: string) => {
  switch (type) {
    case 'youtube': return 'bg-red-100 text-red-800';
    case 'vimeo': return 'bg-blue-100 text-blue-800';
    case 'direct_upload': return 'bg-green-100 text-green-800';
    case 'embed_link': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function VideoCoursesTable({
  videoCourses,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  difficultyFilter,
  setDifficultyFilter,
  videoTypeFilter,
  setVideoTypeFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourse,
  formatDate,
  formatDuration,
  formatFileSize
}: VideoCoursesTableProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCourses(
      selectedCourses.length === videoCourses.length ? [] : videoCourses.map(c => c._id)
    );
  };

  const getUniqueCategories = () => {
    const categories = videoCourses.map(course => course.category);
    return [...new Set(categories)].sort();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Courses</h2>
          <p className="text-gray-600">Manage video courses and learning content</p>
        </div>
        <button
          onClick={onCreateCourse}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Video Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Video Type Filter */}
          <select
            value={videoTypeFilter}
            onChange={(e) => setVideoTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="direct_upload">Direct Upload</option>
            <option value="embed_link">Embed Link</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="viewCount-desc">Most Viewed</option>
            <option value="viewCount-asc">Least Viewed</option>
            <option value="publishDate-desc">Recently Published</option>
            <option value="sortOrder-asc">Manual Order</option>
          </select>
        </div>
      </div>

      {/* Video Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === videoCourses.length && videoCourses.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Analytics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videoCourses.map((course) => {
                const VideoTypeIcon = getVideoTypeIcon(course.videoType);
                
                return (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => toggleCourseSelection(course._id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="h-12 w-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-12 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {course.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{course.category}</span>
                            {course.instructor && (
                              <>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{course.instructor}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <VideoTypeIcon className="h-4 w-4" />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVideoTypeColor(course.videoType)}`}>
                            {course.videoType.replace('_', ' ')}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        {course.duration && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(course.duration)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {course.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                          {course.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.isPublic ? 'Public' : 'Private'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Eye className="h-4 w-4 mr-1" />
                          {course.viewCount.toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {course.completionCount.toLocaleString()}
                        </div>
                        {course.averageRating && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 mr-1" />
                            {course.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(course.createdAt)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewCourse(course)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="View Course"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditCourse(course)}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                          title="Edit Course"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCourse(course._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Delete Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {videoCourses.length === 0 && (
          <div className="text-center py-12">
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No video courses</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new video course.</p>
            <div className="mt-6">
              <button
                onClick={onCreateCourse}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Video Course
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected Actions */}
      {selectedCourses.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedCourses([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}