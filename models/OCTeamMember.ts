import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for an OC Team Member document
export interface IOCTeamMember extends Document {
  fullName: string;
  email: string;
  phone: string;
  department: 'Sponsoring' | 'Media' | 'Logistics';
  institute: string;
  submissionDate: Date;
  paid: boolean;
}

// Create the OC Team Member schema
const OCTeamMemberSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    department: { 
      type: String, 
      required: true,
      enum: ['Sponsoring', 'Media', 'Logistics']
    },
    institute: { type: String, required: true },
    paid: { type: Boolean, default: false },
    submissionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.OCTeamMember || mongoose.model<IOCTeamMember>('OCTeamMember', OCTeamMemberSchema);