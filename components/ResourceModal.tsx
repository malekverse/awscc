'use client';

import { useState } from 'react';
import { X, Upload, Link, FileText, Video } from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceData: FormData) => Promise<void>;
  loading?: boolean;
}

export default function ResourceModal({ isOpen, onClose, onSubmit, loading = false }: ResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'link' | 'video_course',
    url: '',
    category: '',
    tags: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    isPublic: true
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('type', formData.type);
    submitData.append('category', formData.category);
    submitData.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
    submitData.append('difficulty', formData.difficulty);
    submitData.append('isPublic', formData.isPublic.toString());
    submitData.append('createdBy', 'admin'); // This should be the actual admin ID
    
    if (formData.type === 'document' && file) {
      submitData.append('file', file);
    } else if ((formData.type === 'link' || formData.type === 'video_course') && formData.url) {
      submitData.append('url', formData.url);
    }
    
    await onSubmit(submitData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'document',
      url: '',
      category: '',
      tags: '',
      difficulty: 'beginner',
      isPublic: true
    });
    setFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-[#7C4DFF] text-white rounded-t-xl">
          <h2 className="text-xl font-semibold">Add New Resource</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-card">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter resource title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter resource description"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            >
              <option value="document">Document</option>
              <option value="link">Link</option>
              <option value="video_course">Video Course</option>
            </select>
          </div>

          {/* File Upload for Documents */}
          {formData.type === 'document' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                File Upload *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 text-primary mx-auto" />
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">File selected successfully</p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-destructive hover:text-destructive/80"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-foreground">
                      Drag and drop a file here, or{' '}
                      <label className="text-primary hover:text-primary/80 cursor-pointer">
                        browse
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT (No size limit)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL for Links and Video Courses */}
          {(formData.type === 'link' || formData.type === 'video_course') && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                URL *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            >
              <option value="">Select a category</option>
              <option value="AWS Fundamentals">AWS Fundamentals</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="DevOps">DevOps</option>
              <option value="Security">Security</option>
              <option value="Networking">Networking</option>
              <option value="Databases">Databases</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Certification Prep">Certification Prep</option>
              <option value="Best Practices">Best Practices</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas</p>
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-foreground mb-2">
              Difficulty Level *
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Public/Private */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Make this resource public</span>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Public resources are visible to all members
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary border border-border rounded-lg hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.description || !formData.category || (formData.type === 'document' && !file) || ((formData.type === 'link' || formData.type === 'video_course') && !formData.url)}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}