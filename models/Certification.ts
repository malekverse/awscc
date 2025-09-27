import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Certification document
export interface ICertification extends Document {
  name: string;
  description: string;
  issuer: string; // Organization or entity issuing the certification
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requirements: string[];
  validityPeriod?: number; // Validity in months (null for lifetime)
  certificateTemplateUrl?: string; // AWS S3 URL for certificate template
  badgeUrl?: string; // AWS S3 URL for digital badge
  isActive: boolean;
  createdBy: string; // Admin ID who created the certification
  lastModifiedBy?: string;
  totalIssued: number; // Count of how many times this certification was issued
}

// Define the interface for Member Certifications (junction table)
export interface IMemberCertification extends Document {
  memberId: string;
  certificationId: string;
  issuedDate: Date;
  expiryDate?: Date;
  issuedBy: string; // Admin ID who issued the certification
  certificateNumber: string; // Unique certificate number
  certificateUrl?: string; // AWS S3 URL for the issued certificate
  status: 'active' | 'expired' | 'revoked';
  revokedBy?: string; // Admin ID who revoked (if applicable)
  revokedDate?: Date;
  revokedReason?: string;
  verificationCode: string; // Unique code for certificate verification
}

// Create the Certification schema
const CertificationSchema: Schema = new Schema(
  {
    name: { 
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
    issuer: { 
      type: String, 
      required: true,
      trim: true
    },
    category: { 
      type: String, 
      required: true,
      trim: true
    },
    difficulty: { 
      type: String, 
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    requirements: { 
      type: [String], 
      required: true 
    },
    validityPeriod: { 
      type: Number, // in months
      min: 1
    },
    certificateTemplateUrl: { type: String },
    badgeUrl: { type: String },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: { 
      type: String, 
      required: true 
    },
    lastModifiedBy: { type: String },
    totalIssued: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

// Create the Member Certification schema
const MemberCertificationSchema: Schema = new Schema(
  {
    memberId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member',
      required: true 
    },
    certificationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Certification',
      required: true 
    },
    issuedDate: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
    expiryDate: { type: Date },
    issuedBy: { 
      type: String, 
      required: true 
    },
    certificateNumber: { 
      type: String, 
      required: true,
      unique: true
    },
    certificateUrl: { type: String },
    status: { 
      type: String, 
      required: true,
      enum: ['active', 'expired', 'revoked'],
      default: 'active'
    },
    revokedBy: { type: String },
    revokedDate: { type: Date },
    revokedReason: { type: String },
    verificationCode: { 
      type: String, 
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

// Create indexes for better query performance
CertificationSchema.index({ category: 1, difficulty: 1 });
CertificationSchema.index({ isActive: 1 });

MemberCertificationSchema.index({ memberId: 1 });
MemberCertificationSchema.index({ certificationId: 1 });
MemberCertificationSchema.index({ status: 1 });
MemberCertificationSchema.index({ certificateNumber: 1 });
MemberCertificationSchema.index({ verificationCode: 1 });

export const Certification = mongoose.models.Certification || mongoose.model<ICertification>('Certification', CertificationSchema);
export const MemberCertification = mongoose.models.MemberCertification || mongoose.model<IMemberCertification>('MemberCertification', MemberCertificationSchema);

export default Certification;