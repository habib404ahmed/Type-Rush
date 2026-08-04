import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    eventCode: {
      type: String,
      required: [true, 'Event code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    joinUrl: {
      type: String,
      default: '',
    },
    qrGenerated: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Ended', 'draft', 'scheduled', 'active', 'completed', 'cancelled'],
      default: 'Active',
      index: true,
    },
    duration: {
      type: Number,
      enum: [30, 60, 90, 120],
      default: 60,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Random'],
      default: 'Medium',
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    paragraphIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paragraph',
      },
    ],
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

export const Event = mongoose.model('Event', eventSchema);
