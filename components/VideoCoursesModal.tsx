'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Youtube, 
  Video, 
  ExternalLink, 
  Save, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Tag,
  User,
  Calendar,
  Star,
  Globe,
  Lock
} from 'lucide-react';

interface VideoCourse {
  _id?: string;
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
  metaDescription?: string;
  sortOrder?: number;
}

interface VideoCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: VideoCourse) => Promise<void>;
  course?: VideoCourse | null;
  isLoading?: boolean;
}

const defaultCourse: VideoCourse = {
  title: '',
  description: '',
  category: '',
  tags: [],
  difficulty: 'beginner',
  videoType: 'youtube',
  videoUrl: '',
  embedCode: '',
  thumbnailUrl: '',
  duration: undefined,
  videoQuality: '',
  fileSize: undefined,
  instructor: '',
  prerequisites: [],
  learningObjectives: [],
  isPublic: true,
  isActive: true,
  isFeatured: false,
  publishDate: '',
  metaDescription: '',
  sortOrder: 0
};

export default function VideoCoursesModal({
  isOpen,
  onClose,
  onSave,
  course,
  isLoading = false
}: VideoCoursesModalProps) {
  const [formData, setFormData] = useState<VideoCourse>(defaultCourse);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');

  useEffect(() => {
    if (course) {
      setFormData(course);
      setDurationInput(course.duration ? formatDuration(course.duration) : '');
    } else {
      setFormData(defaultCourse);
      setDurationInput('');
    }
    setErrors({});
    setActiveTab('basic');
  }, [course, isOpen]);

  useEffect(() => {
    if (formData.videoType === 'youtube' && formData.videoUrl) {
      const videoId = extractYouTubeVideoId(formData.videoUrl);
      if (videoId) {
        setPreviewUrl(`https://www.youtube.com/embed/${videoId}`);
        if (!formData.thumbnailUrl) {
          setFormData(prev => ({
            ...prev,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          }));
        }
      }
    } else if (formData.videoType === 'vimeo' && formData.videoUrl) {
      const videoId = extractVimeoVideoId(formData.videoUrl);
      if (videoId) {
        setPreviewUrl(`https://player.vimeo.com/video/${videoId}`);
      }
    } else {
      setPreviewUrl('');
    }
  }, [formData.videoType, formData.videoUrl]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const extractVimeoVideoId = (url: string): string | null => {
    const regex = /(?:vimeo\.com\/)([0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video URL is required';
    } else {
      if (formData.videoType === 'youtube' && !extractYouTubeVideoId(formData.videoUrl)) {
        newErrors.videoUrl = 'Please enter a valid YouTube URL';
      } else if (formData.videoType === 'vimeo' && !extractVimeoVideoId(formData.videoUrl)) {
        newErrors.videoUrl = 'Please enter a valid Vimeo URL';
      }
    }

    if (formData.duration && formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.fileSize && formData.fileSize <= 0) {
      newErrors.fileSize = 'File size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleInputChange = (field: keyof VideoCourse, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites?.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...(prev.prerequisites || []), newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prereqToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites?.filter(prereq => prereq !== prereqToRemove) || []
    }));
  };

  const addObjective = () => {
    if (newObjective.trim() && !formData.learningObjectives?.includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...(prev.learningObjectives || []), newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (objToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives?.filter(obj => obj !== objToRemove) || []
    }));
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseDuration = (timeString: string): number => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'video', label: 'Video Details', icon: Video },
    { id: 'content', label: 'Content', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Star }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {course ? 'Edit Video Course' : 'Add New Video Course'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter course title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter course description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Programming, Design, Marketing"
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor || ''}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Instructor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Details Tab */}
            {activeTab === 'video' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
                      { value: 'vimeo', label: 'Vimeo', icon: Video, color: 'blue' },
                      { value: 'direct_upload', label: 'Direct Upload', icon: Upload, color: 'green' },
                      { value: 'embed_link', label: 'Embed Link', icon: ExternalLink, color: 'purple' }
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange('videoType', type.value)}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            formData.videoType === type.value
                              ? `border-${type.color}-500 bg-${type.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-6 w-6 ${
                            formData.videoType === type.value ? `text-${type.color}-600` : 'text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            formData.videoType === type.value ? `text-${type.color}-900` : 'text-gray-700'
                          }`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.videoUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={
                      formData.videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                      formData.videoType === 'vimeo' ? 'https://vimeo.com/...' :
                      'Enter video URL'
                    }
                  />
                  {errors.videoUrl && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.videoUrl}
                    </p>
                  )}
                </div>

                {formData.videoType === 'embed_link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Embed Code (Optional)
                    </label>
                    <textarea
                      value={formData.embedCode || ''}
                      onChange={(e) => handleInputChange('embedCode', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="<iframe src=... ></iframe>"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl || ''}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  {formData.thumbnailUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="h-32 w-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (MM:SS or HH:MM:SS)
                    </label>
                    <input
                      type="text"
                      value={durationInput}
                      onChange={(e) => {
                        setDurationInput(e.target.value);
                      }}
                      onBlur={(e) => {
                        const duration = parseDuration(e.target.value);
                        if (duration > 0) {
                          handleInputChange('duration', duration);
                          setDurationInput(formatDuration(duration));
                        } else if (e.target.value.trim() === '') {
                          handleInputChange('duration', undefined);
                          setDurationInput('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="10:30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Quality
                    </label>
                    <select
                      value={formData.videoQuality || ''}
                      onChange={(e) => handleInputChange('videoQuality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select quality</option>
                      <option value="720p">720p HD</option>
                      <option value="1080p">1080p Full HD</option>
                      <option value="1440p">1440p 2K</option>
                      <option value="2160p">2160p 4K</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={formData.fileSize || ''}
                      onChange={(e) => handleInputChange('fileSize', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="100"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Video Preview */}
                {previewUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Preview
                    </label>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={previewUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prerequisites
                  </label>
                  <div className="space-y-2 mb-4">
                    {formData.prerequisites?.map((prereq, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{prereq}</span>
                        <button
                          type="button"
                          onClick={() => removePrerequisite(prereq)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a prerequisite"
                    />
                    <button
                      type="button"
                      onClick={addPrerequisite}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <div className="space-y-2 mb-4">
                    {formData.learningObjectives?.map((objective, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{objective}</span>
                        <button
                          type="button"
                          onClick={() => removeObjective(objective)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a learning objective"
                    />
                    <button
                      type="button"
                      onClick={addObjective}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description (SEO)
                  </label>
                  <textarea
                    value={formData.metaDescription || ''}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief description for search engines (max 160 characters)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {(formData.metaDescription || '').length}/160 characters
                  </p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Visibility & Status</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Public Course</p>
                          <p className="text-sm text-gray-500">Visible to all members</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('isPublic', !formData.isPublic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.isPublic ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Active Course</p>
                          <p className="text-sm text-gray-500">Available for viewing</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('isActive', !formData.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.isActive ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Featured Course</p>
                          <p className="text-sm text-gray-500">Highlighted in listings</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('isFeatured', !formData.isFeatured)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.isFeatured ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.isFeatured ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Publishing</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publish Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.publishDate || ''}
                        onChange={(e) => handleInputChange('publishDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder || 0}
                        onChange={(e) => handleInputChange('sortOrder', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Lower numbers appear first in listings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {course ? 'Update Course' : 'Create Course'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}