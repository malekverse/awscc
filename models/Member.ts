import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Member document
export interface IMember extends Document {
  fullName: string;
  email: string;
  phone?: string;
  dob: string;
  role: string;
  organization?: string;
  linkedin?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  certifications?: string;
  otherPlatforms?: string;
  whyJoin: string;
  interests: string[];
  otherInterest?: string;
  contribution: string;
  meetingPreference: 'weekday' | 'weekend' | 'flexible';
  heardFrom: 'wordOfMouth' | 'socialMedia' | 'emailNewsletter' | 'website' | 'other';
  otherSourceText?: string;
  agreement: boolean;
  paid: boolean;
  password?: string;
  temporaryPassword?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailSent: boolean;
  paidDate?: Date;
  paidBy?: string; // Admin who marked as paid
  submissionDate: Date;
}

// Create the Member schema
const MemberSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dob: { type: String, required: true },
    role: { type: String, required: true },
    organization: { type: String },
    linkedin: { type: String },
    experience: { 
      type: String, 
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    certifications: { type: String },
    otherPlatforms: { type: String },
    whyJoin: { type: String, required: true },
    interests: { type: [String], required: true },
    otherInterest: { type: String },
    contribution: { type: String, required: true },
    meetingPreference: { 
      type: String, 
      required: true,
      enum: ['weekday', 'weekend', 'flexible']
    },
    heardFrom: { 
      type: String, 
      required: true,
      enum: ['wordOfMouth', 'socialMedia', 'emailNewsletter', 'website', 'other']
    },
    otherSourceText: { type: String },
    agreement: { type: Boolean, required: true },
    paid: { type: Boolean, default: false },
    password: { type: String },
    temporaryPassword: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    emailSent: { type: Boolean, default: false },
    paidDate: { type: Date },
    paidBy: { type: String },
    submissionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);