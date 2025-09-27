'use client';

import { useState } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (certificationData: any) => Promise<void>;
  loading?: boolean;
  certification?: any; // For editing existing certifications
}

export default function CertificationModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  certification = null
}: CertificationModalProps) {
  const [formData, setFormData] = useState({
    name: certification?.name || '',
    description: certification?.description || '',
    provider: certification?.provider || '',
    category: certification?.category || '',
    difficulty: certification?.difficulty || 'beginner',
    requirements: certification?.requirements?.join('\n') || '',
    validityPeriod: certification?.validityPeriod || 12,
    certificateTemplate: certification?.certificateTemplate || '',
    badgeUrl: certification?.badgeUrl || '',
    isActive: certification?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Certification name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'Provider is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty level is required';
    }

    if (formData.validityPeriod < 1) {
      newErrors.validityPeriod = 'Validity period must be at least 1 month';
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
      const submitData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim() !== ''),
        validityPeriod: Number(formData.validityPeriod)
      };
      
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        provider: '',
        category: '',
        difficulty: 'beginner',
        requirements: '',
        validityPeriod: 12,
        certificateTemplate: '',
        badgeUrl: '',
        isActive: true
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting certification:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Award className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {certification ? 'Edit Certification' : 'Add New Certification'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certification Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Certification Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., AWS Certified Solutions Architect"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Provider */}
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                Provider *
              </label>
              <input
                type="text"
                id="provider"
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.provider ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Amazon Web Services"
                disabled={loading}
              />
              {errors.provider && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.provider}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Select Category</option>
                <option value="aws">AWS</option>
                <option value="cloud">Cloud Computing</option>
                <option value="devops">DevOps</option>
                <option value="security">Security</option>
                <option value="data">Data & Analytics</option>
                <option value="ai">AI/ML</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.difficulty ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              {errors.difficulty && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.difficulty}
                </p>
              )}
            </div>

            {/* Validity Period */}
            <div>
              <label htmlFor="validityPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                Validity Period (months) *
              </label>
              <input
                type="number"
                id="validityPeriod"
                min="1"
                value={formData.validityPeriod}
                onChange={(e) => handleInputChange('validityPeriod', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.validityPeriod ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.validityPeriod && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.validityPeriod}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the certification, its objectives, and what it validates..."
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <textarea
              id="requirements"
              rows={4}
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter each requirement on a new line...\ne.g.:\n- 6 months of AWS experience\n- Basic understanding of cloud concepts\n- Completion of prerequisite courses"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter each requirement on a separate line
            </p>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certificate Template */}
            <div>
              <label htmlFor="certificateTemplate" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Template URL
              </label>
              <input
                type="url"
                id="certificateTemplate"
                value={formData.certificateTemplate}
                onChange={(e) => handleInputChange('certificateTemplate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/certificate-template.pdf"
                disabled={loading}
              />
            </div>

            {/* Badge URL */}
            <div>
              <label htmlFor="badgeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Badge URL
              </label>
              <input
                type="url"
                id="badgeUrl"
                value={formData.badgeUrl}
                onChange={(e) => handleInputChange('badgeUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/badge.png"
                disabled={loading}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              disabled={loading}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (available for assignment to members)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{certification ? 'Update Certification' : 'Create Certification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}