import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['AUTH', 'EVENT', 'STUDENT', 'TEST', 'ANTI_CHEAT', 'SYSTEM'],
      default: 'SYSTEM',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userType: {
      type: String,
      enum: ['Admin', 'Student', 'System'],
      default: 'System',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

logSchema.index({ createdAt: -1 });

export const Log = mongoose.model('Log', logSchema);
