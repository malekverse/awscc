import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a VideoCourse document
export interface IVideoCourse extends Document {
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Video source information
  videoType: 'youtube' | 'vimeo' | 'direct_upload' | 'embed_link';
  videoUrl: string; // YouTube URL, Vimeo URL, S3 URL, or embed link
  embedCode?: string; // For custom embed codes
  thumbnailUrl?: string; // Custom thumbnail or auto-generated
  
  // Video metadata
  duration?: number; // Duration in seconds
  videoQuality?: string; // e.g., '1080p', '720p', '480p'
  fileSize?: number; // For direct uploads, size in bytes
  
  // Course information
  instructor?: string; // Instructor name
  prerequisites?: string[]; // List of prerequisites
  learningObjectives?: string[]; // What students will learn
  
  // Status and visibility
  isPublic: boolean;
  isActive: boolean;
  isFeatured: boolean;
  publishDate?: Date;
  
  // Admin tracking
  createdBy: string; // Admin ID who created the course
  lastModifiedBy?: string; // Admin ID who last modified
  
  // Analytics
  viewCount: number;
  completionCount: number;
  averageRating?: number;
  
  // SEO and organization
  slug?: string; // URL-friendly identifier
  metaDescription?: string;
  sortOrder?: number; // For manual ordering
}

// Create the VideoCourse schema
const VideoCourseSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    description: { 
      type: String, 
      required: true,
      maxlength: 2000
    },
    category: { 
      type: String, 
      required: true,
      trim: true
    },
    tags: { 
      type: [String], 
      default: []
    },
    difficulty: { 
      type: String, 
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    
    // Video source information
    videoType: {
      type: String,
      required: true,
      enum: ['youtube', 'vimeo', 'direct_upload', 'embed_link']
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true
    },
    embedCode: {
      type: String,
      trim: true
    },
    thumbnailUrl: {
      type: String,
      trim: true
    },
    
    // Video metadata
    duration: {
      type: Number,
      min: 0
    },
    videoQuality: {
      type: String,
      trim: true
    },
    fileSize: {
      type: Number,
      min: 0
    },
    
    // Course information
    instructor: {
      type: String,
      trim: true
    },
    prerequisites: {
      type: [String],
      default: []
    },
    learningObjectives: {
      type: [String],
      default: []
    },
    
    // Status and visibility
    isPublic: { 
      type: Boolean, 
      default: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    publishDate: { 
      type: Date, 
      default: Date.now 
    },
    
    // Admin tracking
    createdBy: { 
      type: String, 
      required: true 
    },
    lastModifiedBy: { 
      type: String 
    },
    
    // Analytics
    viewCount: { 
      type: Number, 
      default: 0 
    },
    completionCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },
    
    // SEO and organization
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Create indexes for better query performance
VideoCourseSchema.index({ category: 1, difficulty: 1 });
VideoCourseSchema.index({ isPublic: 1, isActive: 1 });
VideoCourseSchema.index({ tags: 1 });
VideoCourseSchema.index({ isFeatured: 1, publishDate: -1 });
VideoCourseSchema.index({ slug: 1 }, { unique: true, sparse: true });
VideoCourseSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to generate slug if not provided
VideoCourseSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.models.VideoCourse || mongoose.model<IVideoCourse>('VideoCourse', VideoCourseSchema);