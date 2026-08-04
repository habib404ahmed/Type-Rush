import mongoose from 'mongoose';

const paragraphSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Paragraph title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Paragraph text content is required'],
      trim: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    charCount: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    usageCount: {
      type: Number,
      default: 0,
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

// Pre-save hook to calculate word and char counts automatically
paragraphSchema.pre('save', function (next) {
  if (this.content) {
    this.charCount = this.content.length;
    this.wordCount = this.content.trim().split(/\s+/).filter(Boolean).length;
  }
  next();
});

export const Paragraph = mongoose.model('Paragraph', paragraphSchema);
