import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Member document
export interface IMember extends Document {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  organization?: string;
  facebook?: string;
  experience: string;
  interests: string[];
  otherInterest?: string;
  meetingPreference: string;
  heardFrom: string;
  otherSourceText?: string;
  agreedToTerms: boolean;
  paid: boolean;
  paidDate?: Date;
  paidBy?: string;
  emailSent: boolean;
  isActive: boolean;
  password?: string;
  temporaryPassword?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  joinedAt: Date;
}

// Create the Member schema
const MemberSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, required: true },
    organization: { type: String },
    facebook: { type: String },
    experience: { type: String },
    interests: { type: [String], required: true },
    otherInterest: { type: String },
    meetingPreference: { type: String },
    heardFrom: { type: String },
    otherSourceText: { type: String },
    agreedToTerms: { type: Boolean, required: true },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
    paidBy: { type: String },
    emailSent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    password: { type: String },
    temporaryPassword: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);