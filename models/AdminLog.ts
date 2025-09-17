import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for an AdminLog document
export interface IAdminLog extends Document {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'member' | 'admin' | 'system';
  targetId?: string;
  targetEmail?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Create the AdminLog schema
const AdminLogSchema: Schema = new Schema(
  {
    adminId: { 
      type: String, 
      required: true 
    },
    adminEmail: { 
      type: String, 
      required: true 
    },
    action: { 
      type: String, 
      required: true,
      enum: [
        'login',
        'logout',
        'member_payment_status_changed',
        'member_activated',
        'member_deactivated',
        'email_sent',
        'password_reset',
        'admin_created',
        'admin_updated',
        'admin_deleted',
        'bulk_operation',
        'export_data',
        'system_config_changed'
      ]
    },
    targetType: { 
      type: String, 
      required: true,
      enum: ['member', 'admin', 'system']
    },
    targetId: { 
      type: String 
    },
    targetEmail: { 
      type: String 
    },
    details: { 
      type: Schema.Types.Mixed,
      default: {}
    },
    ipAddress: { 
      type: String 
    },
    userAgent: { 
      type: String 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Index for efficient querying
AdminLogSchema.index({ adminId: 1, timestamp: -1 });
AdminLogSchema.index({ action: 1, timestamp: -1 });
AdminLogSchema.index({ targetType: 1, targetId: 1 });

// Create and export the model
export default mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);