import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Resource document
export interface IResource extends Document {
  title: string;
  description: string;
  type: 'link' | 'document' | 'video_course';
  url?: string; // For links and video courses
  fileUrl?: string; // For documents stored in AWS S3
  fileName?: string; // Original file name for documents
  fileSize?: number; // File size in bytes
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  createdBy: string; // Admin ID who created the resource
  lastModifiedBy?: string; // Admin ID who last modified
  viewCount: number;
  downloadCount: number; // For documents
  isActive: boolean;
  publishDate?: Date;
  expiryDate?: Date; // Optional expiry for time-sensitive resources
}

// Create the Resource schema
const ResourceSchema: Schema = new Schema(
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
      maxlength: 1000
    },
    type: { 
      type: String, 
      required: true,
      enum: ['link', 'document', 'video_course']
    },
    url: { 
      type: String,
      validate: {
        validator: function(this: IResource, v: string) {
          // URL is required for links and video courses
          return this.type === 'document' || (v && v.length > 0);
        },
        message: 'URL is required for links and video courses'
      }
    },
    fileUrl: { 
      type: String,
      validate: {
        validator: function(this: IResource, v: string) {
          // File URL is required for documents
          return this.type !== 'document' || (v && v.length > 0);
        },
        message: 'File URL is required for documents'
      }
    },
    fileName: { type: String },
    fileSize: { type: Number },
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
    isPublic: { 
      type: Boolean, 
      default: true 
    },
    createdBy: { 
      type: String, 
      required: true 
    },
    lastModifiedBy: { type: String },
    viewCount: { 
      type: Number, 
      default: 0 
    },
    downloadCount: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    publishDate: { 
      type: Date, 
      default: Date.now 
    },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);

// Create indexes for better query performance
ResourceSchema.index({ type: 1, category: 1 });
ResourceSchema.index({ isPublic: 1, isActive: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ difficulty: 1 });

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);