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
  meetingPreference: string;
  heardFrom: string;
  agreedToTerms: boolean;
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
    meetingPreference: { type: String },
    heardFrom: { type: String },
    agreedToTerms: { type: Boolean, required: true },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);