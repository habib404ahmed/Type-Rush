import { Student } from '../models/Student.js';
import { Result } from '../models/Result.js';
import { Event } from '../models/Event.js';

// @desc    Get dashboard metrics summary
// @route   GET /api/v1/dashboard/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalParticipants = await Student.countDocuments({ isDeleted: false });
    const completed = await Result.countDocuments();
    const pending = Math.max(0, totalParticipants - completed);

    // Aggregate WPM and Accuracy metrics
    const stats = await Result.aggregate([
      {
        $group: {
          _id: null,
          highestWpm: { $max: '$netWpm' },
          avgWpm: { $avg: '$netWpm' },
          avgAccuracy: { $avg: '$accuracy' },
        },
      },
    ]);

    const metrics = stats[0] || {
      highestWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0,
    };

    res.status(200).json({
      success: true,
      stats: {
        totalParticipants,
        completed,
        pending,
        highestWpm: metrics.highestWpm || 0,
        avgWpm: Math.round(metrics.avgWpm || 0),
        avgAccuracy: Math.round(metrics.avgAccuracy || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get participants list with filters
// @route   GET /api/v1/dashboard/participants
// @access  Private (Admin)
export const getParticipants = async (req, res, next) => {
  try {
    const { department, eventId, search } = req.query;

    const query = { isDeleted: false };
    if (department && department !== 'All') {
      query.department = department;
    }
    if (eventId) {
      query.eventId = eventId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const participants = await Student.find(query)
      .populate('eventId', 'title eventCode')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: participants.length,
      participants,
    });
  } catch (error) {
    next(error);
  }
};
