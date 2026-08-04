import { Result } from '../models/Result.js';
import { Student } from '../models/Student.js';
import { Event } from '../models/Event.js';
import { Log } from '../models/Log.js';

// Helper function to update event ranks
const updateEventRankings = async (eventId) => {
  const results = await Result.find({ eventId }).sort({
    finalScore: -1,
    netWpm: -1,
    accuracy: -1,
  });

  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1;
    await results[i].save();
  }
};

// @desc    Submit typing test result
// @route   POST /api/v1/results/submit
// @access  Public (Student)
export const submitResult = async (req, res, next) => {
  try {
    const {
      studentId,
      eventId,
      paragraphId,
      grossWpm,
      netWpm,
      accuracy,
      mistakes,
      correctChars,
      incorrectChars,
      warningsCount,
      timeTakenSeconds,
    } = req.body;

    if (!studentId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Event ID are required for submission',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Check one attempt restriction
    const existingResult = await Result.findOne({ studentId });
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed your typing attempt for this event.',
        result: existingResult,
      });
    }

    // Formula: Score = (Net WPM * 10) + Accuracy - (Mistakes * 5)
    const calcScore = Math.max(
      0,
      Math.round((netWpm || 0) * 10 + (accuracy || 0) - (mistakes || 0) * 5)
    );

    const result = await Result.create({
      studentId,
      eventId,
      paragraphId,
      grossWpm: grossWpm || 0,
      netWpm: netWpm || 0,
      accuracy: accuracy || 0,
      mistakes: mistakes || 0,
      correctChars: correctChars || 0,
      incorrectChars: incorrectChars || 0,
      finalScore: calcScore,
      warningsCount: warningsCount || 0,
      timeTakenSeconds: timeTakenSeconds || 0,
    });

    // Mark student as attempted
    student.hasAttempted = true;
    await student.save();

    // Recalculate event rankings
    await updateEventRankings(eventId);

    // Fetch updated result with computed rank
    const updatedResult = await Result.findById(result._id).populate('studentId', 'name rollNumber department');

    // Notify live admin monitors & live leaderboards via Socket.IO
    if (req.io) {
      req.io.to(`event_${eventId}`).emit('test_completed', {
        eventId,
        studentName: student.name,
        netWpm: updatedResult.netWpm,
        accuracy: updatedResult.accuracy,
        rank: updatedResult.rank,
      });
      req.io.to(`event_${eventId}`).emit('leaderboard_update', { eventId });
    }

    await Log.create({
      action: 'TEST_SUBMITTED',
      category: 'TEST',
      userId: studentId,
      userType: 'Student',
      ipAddress: req.ip,
      details: { netWpm: updatedResult.netWpm, accuracy: updatedResult.accuracy, score: calcScore },
    });

    res.status(201).json({
      success: true,
      message: 'Result submitted successfully',
      result: updatedResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live leaderboard for an event
// @route   GET /api/v1/results/leaderboard/:eventId
// @access  Public
export const getEventLeaderboard = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const leaderboard = await Result.find({ eventId })
      .populate('studentId', 'name rollNumber department')
      .sort({ finalScore: -1, netWpm: -1, accuracy: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get result by student ID
// @route   GET /api/v1/results/student/:studentId
// @access  Public
export const getStudentResult = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const result = await Result.findOne({ studentId })
      .populate('studentId', 'name rollNumber department')
      .populate('eventId', 'title eventCode');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this student',
      });
    }

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
};
