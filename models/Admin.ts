import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for an Admin document
export interface IAdmin extends Document {
  email: string;
  password: string;
  fullName: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdBy?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create the Admin schema
const AdminSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true,
      minlength: 8
    },
    fullName: { 
      type: String, 
      required: true,
      trim: true
    },
    role: { 
      type: String, 
      required: true,
      enum: ['super_admin', 'admin'],
      default: 'admin'
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastLogin: { 
      type: Date 
    },
    createdBy: { 
      type: String 
    }
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);