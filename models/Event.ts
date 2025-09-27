import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for an Event document
export interface IEvent extends Document {
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'conference' | 'meetup' | 'training' | 'other';
  startDate: Date;
  endDate: Date;
  location?: string; // Physical location
  virtualLink?: string; // Online meeting link
  isVirtual: boolean;
  maxAttendees?: number;
  currentAttendees: number;
  registrationDeadline?: Date;
  price: number; // 0 for free events
  currency: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  agenda?: string; // Event agenda/schedule
  speakerInfo?: string; // Information about speakers
  materials?: string[]; // Links to event materials
  imageUrl?: string; // AWS S3 URL for event banner/image
  isPublic: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy: string; // Admin ID who created the event
  lastModifiedBy?: string;
  registrationRequired: boolean;
  certificateOffered: boolean; // Whether completion certificate is offered
  certificationId?: string; // Reference to certification if offered
}

// Define the interface for Event Registrations
export interface IEventRegistration extends Document {
  eventId: string;
  memberId: string;
  registrationDate: Date;
  status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'free';
  paymentDate?: Date;
  attendanceMarked: boolean;
  attendanceDate?: Date;
  feedback?: string;
  rating?: number; // 1-5 stars
  certificateIssued: boolean;
  certificateUrl?: string; // AWS S3 URL for completion certificate
  notes?: string; // Admin notes
}

// Create the Event schema
const EventSchema: Schema = new Schema(
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
    type: { 
      type: String, 
      required: true,
      enum: ['workshop', 'webinar', 'conference', 'meetup', 'training', 'other']
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true,
      validate: {
        validator: function(this: IEvent, v: Date) {
          return v > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    location: { type: String },
    virtualLink: { type: String },
    isVirtual: { 
      type: Boolean, 
      default: false 
    },
    maxAttendees: { 
      type: Number,
      min: 1
    },
    currentAttendees: { 
      type: Number, 
      default: 0 
    },
    registrationDeadline: { type: Date },
    price: { 
      type: Number, 
      required: true,
      min: 0,
      default: 0
    },
    currency: { 
      type: String, 
      default: 'USD'
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
    prerequisites: { type: [String] },
    agenda: { type: String },
    speakerInfo: { type: String },
    materials: { type: [String] },
    imageUrl: { type: String },
    isPublic: { 
      type: Boolean, 
      default: true 
    },
    status: { 
      type: String, 
      required: true,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft'
    },
    createdBy: { 
      type: String, 
      required: true 
    },
    lastModifiedBy: { type: String },
    registrationRequired: { 
      type: Boolean, 
      default: true 
    },
    certificateOffered: { 
      type: Boolean, 
      default: false 
    },
    certificationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Certification'
    }
  },
  { timestamps: true }
);

// Create the Event Registration schema
const EventRegistrationSchema: Schema = new Schema(
  {
    eventId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Event',
      required: true 
    },
    memberId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member',
      required: true 
    },
    registrationDate: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
    status: { 
      type: String, 
      required: true,
      enum: ['registered', 'attended', 'no_show', 'cancelled'],
      default: 'registered'
    },
    paymentStatus: { 
      type: String, 
      required: true,
      enum: ['pending', 'paid', 'refunded', 'free'],
      default: 'free'
    },
    paymentDate: { type: Date },
    attendanceMarked: { 
      type: Boolean, 
      default: false 
    },
    attendanceDate: { type: Date },
    feedback: { type: String },
    rating: { 
      type: Number,
      min: 1,
      max: 5
    },
    certificateIssued: { 
      type: Boolean, 
      default: false 
    },
    certificateUrl: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

// Create indexes for better query performance
EventSchema.index({ startDate: 1, status: 1 });
EventSchema.index({ type: 1, category: 1 });
EventSchema.index({ isPublic: 1, status: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ difficulty: 1 });

EventRegistrationSchema.index({ eventId: 1 });
EventRegistrationSchema.index({ memberId: 1 });
EventRegistrationSchema.index({ status: 1 });
EventRegistrationSchema.index({ paymentStatus: 1 });

// Compound index for unique registration per member per event
EventRegistrationSchema.index({ eventId: 1, memberId: 1 }, { unique: true });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export const EventRegistration = mongoose.models.EventRegistration || mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);

export default Event;