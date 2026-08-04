import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      unique: true, // One attempt per student
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    paragraphId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paragraph',
    },
    grossWpm: {
      type: Number,
      required: true,
      default: 0,
    },
    netWpm: {
      type: Number,
      required: true,
      default: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      default: 0,
    },
    mistakes: {
      type: Number,
      required: true,
      default: 0,
    },
    correctChars: {
      type: Number,
      default: 0,
    },
    incorrectChars: {
      type: Number,
      default: 0,
    },
    finalScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    warningsCount: {
      type: Number,
      default: 0,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate final score pre-save hook
resultSchema.pre('save', function (next) {
  // Score = (Net WPM * 10) + Accuracy - (Mistakes * 5)
  const calcScore = Math.max(
    0,
    Math.round(this.netWpm * 10 + this.accuracy - this.mistakes * 5)
  );
  this.finalScore = calcScore;
  next();
});

// Index for instant leaderboard ranking queries
resultSchema.index({ eventId: 1, finalScore: -1, netWpm: -1, accuracy: -1 });

export const Result = mongoose.model('Result', resultSchema);
