'use client';

import { useState } from 'react';
import { X, Calendar, AlertCircle, Upload, MapPin } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: FormData) => Promise<void>;
  loading?: boolean;
  event?: any; // For editing existing events
}

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  event = null
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'workshop',
    date: event?.date || '',
    time: event?.time || '',
    venue: event?.location?.venue || '',
    address: event?.location?.address || '',
    city: event?.location?.city || '',
    isOnline: event?.location?.isOnline || false,
    capacity: event?.capacity || 50,
    registrationDeadline: event?.registrationDeadline || '',
    fee: event?.price || 0,
    currency: event?.currency || 'TND',
    category: event?.category || '',
    tags: event?.tags?.join(', ') || '',
    difficulty: event?.difficulty || 'beginner',
    prerequisites: event?.prerequisites?.join('\n') || '',
    agenda: event?.agenda || '',
    speakerInfo: event?.speakerInfo || '',
    materials: event?.materials?.join('\n') || '',
    isPublic: event?.isPublic ?? true,
    status: event?.status || 'published',
    registrationRequired: event?.registrationRequired ?? true,
    certificateOffered: event?.certificateOffered || false
  });

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }

    if (!formData.isOnline && !formData.venue.trim()) {
      newErrors.venue = 'Venue is required for in-person events';
    }

    if (!formData.isOnline && !formData.city.trim()) {
      newErrors.city = 'City is required for in-person events';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    }

    if (formData.fee < 0) {
      newErrors.fee = 'Fee cannot be negative';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty level is required';
    }

    // Validate registration deadline is before event date
    if (formData.registrationDeadline && formData.date) {
      const regDeadline = new Date(formData.registrationDeadline);
      const eventDate = new Date(formData.date);
      if (regDeadline >= eventDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event date';
      }
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
      const submitData = new FormData();
      
      // Basic event information
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      
      // Combine date and time for startDate
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      submitData.append('startDate', startDateTime.toISOString());
      
      // Set endDate to 2 hours after startDate (default duration)
      const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
      submitData.append('endDate', endDateTime.toISOString());
      
      // Location information
      submitData.append('isVirtual', formData.isOnline.toString());
      if (!formData.isOnline) {
        const locationString = `${formData.venue}, ${formData.address}, ${formData.city}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
        submitData.append('location', locationString);
      }
      
      // Event details
      submitData.append('maxAttendees', formData.capacity.toString());
      if (formData.registrationDeadline) {
        submitData.append('registrationDeadline', new Date(formData.registrationDeadline).toISOString());
      }
      submitData.append('price', formData.fee.toString());
      submitData.append('currency', formData.currency);
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      submitData.append('difficulty', formData.difficulty);
      
      // Optional fields
      if (formData.prerequisites.trim()) {
        submitData.append('prerequisites', JSON.stringify(formData.prerequisites.split('\n').filter(req => req.trim() !== '')));
      }
      if (formData.agenda.trim()) {
        submitData.append('agenda', formData.agenda);
      }
      if (formData.speakerInfo.trim()) {
        submitData.append('speakerInfo', formData.speakerInfo);
      }
      if (formData.materials.trim()) {
        submitData.append('materials', JSON.stringify(formData.materials.split('\n').filter(mat => mat.trim() !== '')));
      }
      
      // Settings
      submitData.append('isPublic', formData.isPublic.toString());
      submitData.append('status', formData.status);
      submitData.append('registrationRequired', formData.registrationRequired.toString());
      submitData.append('certificateOffered', formData.certificateOffered.toString());
      submitData.append('createdBy', 'admin'); // This should be the actual admin ID
      
      // File upload
      if (file) {
        submitData.append('image', file);
      }
      
      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'workshop',
        date: '',
        time: '',
        venue: '',
        address: '',
        city: '',
        isOnline: false,
        capacity: 50,
        registrationDeadline: '',
        fee: 0,
        currency: 'TND',
        category: '',
        tags: '',
        difficulty: 'beginner',
        prerequisites: '',
        agenda: '',
        speakerInfo: '',
        materials: '',
        isPublic: true,
        status: 'published',
        registrationRequired: true,
        certificateOffered: false
      });
      setFile(null);
      setErrors({});
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors(prev => ({ ...prev, file: 'Please select a valid image file (JPEG, PNG, WebP)' }));
        return;
      }
      
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 5MB' }));
        return;
      }
      
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-primary">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-foreground/20 rounded-lg backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-primary-foreground">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors p-1 hover:bg-primary-foreground/20 rounded-lg"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-card">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.title ? 'border-destructive' : 'border-border'
                }`}
                placeholder="e.g., AWS Workshop: Building Serverless Applications"
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                Event Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.type ? 'border-destructive' : 'border-border'
                }`}
                disabled={loading}
              >
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.category ? 'border-destructive' : 'border-border'
                }`}
                placeholder="e.g., AWS, Cloud Computing, DevOps"
                disabled={loading}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.date ? 'border-destructive' : 'border-border'
                }`}
                disabled={loading}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                Event Time *
              </label>
              <input
                type="time"
                id="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.time ? 'border-destructive' : 'border-border'
                }`}
                disabled={loading}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.time}
                </p>
              )}
            </div>

            {/* Registration Deadline */}
            <div>
              <label htmlFor="registrationDeadline" className="block text-sm font-medium text-foreground mb-2">
                Registration Deadline *
              </label>
              <input
                type="date"
                id="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.registrationDeadline ? 'border-destructive' : 'border-border'
                }`}
                disabled={loading}
              />
              {errors.registrationDeadline && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.registrationDeadline}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-foreground mb-2">
                Capacity *
              </label>
              <input
                type="number"
                id="capacity"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.capacity ? 'border-destructive' : 'border-border'
                }`}
                disabled={loading}
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.capacity}
                </p>
              )}
            </div>

            {/* Fee */}
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-foreground mb-2">
                Registration Fee
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  id="fee"
                  min="0"
                  step="0.01"
                  value={formData.fee}
                  onChange={(e) => handleInputChange('fee', parseFloat(e.target.value) || 0)}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                    errors.fee ? 'border-destructive' : 'border-border'
                  }`}
                  disabled={loading}
                />
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  disabled={loading}
                >
                  <option value="TND">TND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              {errors.fee && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fee}
                </p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-foreground mb-2">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                  errors.difficulty ? 'border-destructive' : 'border-border'
                }`}
                disabled={loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.difficulty && (
                <p className="mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.difficulty}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Event Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                errors.description ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Describe the event, its objectives, and what participants will learn..."
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isOnline"
                checked={formData.isOnline}
                onChange={(e) => handleInputChange('isOnline', e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
                disabled={loading}
              />
              <label htmlFor="isOnline" className="text-sm font-medium text-foreground">
                This is an online event
              </label>
            </div>

            {!formData.isOnline && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="venue" className="block text-sm font-medium text-foreground mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                      errors.venue ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="e.g., ISIMS Conference Hall"
                    disabled={loading}
                  />
                  {errors.venue && (
                    <p className="mt-1 text-sm text-destructive flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.venue}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Street address"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
                      errors.city ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="e.g., Sfax"
                    disabled={loading}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-destructive flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Separate multiple tags with commas"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            {/* Prerequisites */}
            <div>
              <label htmlFor="prerequisites" className="block text-sm font-medium text-foreground mb-2">
                Prerequisites
              </label>
              <textarea
                id="prerequisites"
                rows={3}
                value={formData.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Enter each prerequisite on a new line...\ne.g.:\n- Basic AWS knowledge\n- Laptop with internet connection"
                disabled={loading}
              />
            </div>

            {/* Agenda */}
            <div>
              <label htmlFor="agenda" className="block text-sm font-medium text-foreground mb-2">
                Agenda
              </label>
              <textarea
                id="agenda"
                rows={4}
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Detailed agenda for the event..."
                disabled={loading}
              />
            </div>

            {/* Speaker Info */}
            <div>
              <label htmlFor="speakerInfo" className="block text-sm font-medium text-foreground mb-2">
                Speaker Information
              </label>
              <textarea
                id="speakerInfo"
                rows={3}
                value={formData.speakerInfo}
                onChange={(e) => handleInputChange('speakerInfo', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Information about speakers, facilitators, or instructors..."
                disabled={loading}
              />
            </div>

            {/* Materials */}
            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-foreground mb-2">
                Materials
              </label>
              <textarea
                id="materials"
                rows={3}
                value={formData.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                placeholder="Enter each material on a new line...\ne.g.:\n- Presentation slides\n- Code samples\n- Reference documents"
                disabled={loading}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-foreground mb-2">
              Event Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg hover:border-primary/50 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-foreground">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                  >
                    <span>Upload an image</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WebP up to 5MB
                </p>
                {file && (
                  <p className="text-sm text-green-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.file}
              </p>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                disabled={loading}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                  disabled={loading}
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-foreground">
                  Public event (visible to all members)
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="registrationRequired"
                  checked={formData.registrationRequired}
                  onChange={(e) => handleInputChange('registrationRequired', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                  disabled={loading}
                />
                <label htmlFor="registrationRequired" className="text-sm font-medium text-foreground">
                  Registration required
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="certificateOffered"
                  checked={formData.certificateOffered}
                  onChange={(e) => handleInputChange('certificateOffered', e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                  disabled={loading}
                />
                <label htmlFor="certificateOffered" className="text-sm font-medium text-foreground">
                  Certificate offered upon completion
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              )}
              <span>{event ? 'Update Event' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}