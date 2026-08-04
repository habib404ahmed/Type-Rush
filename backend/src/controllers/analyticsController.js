import { Result } from '../models/Result.js';
import { Student } from '../models/Student.js';

// @desc    Get analytics charts aggregation data
// @route   GET /api/v1/analytics/charts
// @access  Private (Admin)
export const getAnalyticsCharts = async (req, res, next) => {
  try {
    // 1. Department comparison (Avg Net WPM & Count per department)
    const deptStats = await Result.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.department',
          avgWpm: { $avg: '$netWpm' },
          avgAccuracy: { $avg: '$accuracy' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgWpm: -1 } },
    ]);

    const departmentComparison = deptStats.map((item) => ({
      department: item._id || 'Unknown',
      avgWpm: Math.round(item.avgWpm || 0),
      avgAccuracy: Math.round(item.avgAccuracy || 0),
      participants: item.count,
    }));

    // 2. Score distribution buckets
    const results = await Result.find().select('finalScore netWpm accuracy');
    const buckets = {
      '0-250': 0,
      '251-500': 0,
      '501-750': 0,
      '751-1000': 0,
      '1000+': 0,
    };

    results.forEach((r) => {
      const score = r.finalScore || 0;
      if (score <= 250) buckets['0-250']++;
      else if (score <= 500) buckets['251-500']++;
      else if (score <= 750) buckets['501-750']++;
      else if (score <= 1000) buckets['751-1000']++;
      else buckets['1000+']++;
    });

    const scoreDistribution = Object.keys(buckets).map((key) => ({
      range: key,
      count: buckets[key],
    }));

    // 3. Top performers list
    const topPerformers = await Result.find()
      .populate('studentId', 'name rollNumber department')
      .sort({ finalScore: -1, netWpm: -1 })
      .limit(5);

    const formattedTopPerformers = topPerformers.map((r, idx) => ({
      rank: idx + 1,
      name: r.studentId?.name || 'Anonymous',
      department: r.studentId?.department || 'N/A',
      netWpm: r.netWpm,
      accuracy: r.accuracy,
      score: r.finalScore,
    }));

    res.status(200).json({
      success: true,
      charts: {
        departmentComparison,
        scoreDistribution,
        topPerformers: formattedTopPerformers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full export data payload for CSV/JSON download
// @route   GET /api/v1/analytics/export
// @access  Private (Admin)
export const getExportData = async (req, res, next) => {
  try {
    const results = await Result.find()
      .populate('studentId', 'name rollNumber department')
      .populate('eventId', 'title eventCode')
      .sort({ finalScore: -1 });

    const exportRows = results.map((r, idx) => ({
      Rank: idx + 1,
      StudentName: r.studentId?.name || 'N/A',
      RollNumber: r.studentId?.rollNumber || 'N/A',
      Department: r.studentId?.department || 'N/A',
      EventCode: r.eventId?.eventCode || 'N/A',
      EventTitle: r.eventId?.title || 'N/A',
      GrossWPM: r.grossWpm,
      NetWPM: r.netWpm,
      AccuracyPercent: r.accuracy,
      Mistakes: r.mistakes,
      FinalScore: r.finalScore,
      WarningsCount: r.warningsCount || 0,
      Date: new Date(r.completedAt).toLocaleString(),
    }));

    res.status(200).json({
      success: true,
      count: exportRows.length,
      data: exportRows,
    });
  } catch (error) {
    next(error);
  }
};
