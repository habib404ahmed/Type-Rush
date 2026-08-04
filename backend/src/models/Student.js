import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department selection is required'],
      enum: ['MBA', 'BBA', 'BCA', 'B.Tech'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    deviceInfo: {
      type: String,
      default: '',
    },
    hasAttempted: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate roll numbers within the same event
studentSchema.index({ eventId: 1, rollNumber: 1, isDeleted: 1 }, { unique: true });

export const Student = mongoose.model('Student', studentSchema);
