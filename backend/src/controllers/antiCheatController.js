import { Log } from '../models/Log.js';

// @desc    Log anti-cheat warning violation
// @route   POST /api/v1/anti-cheat/log-warning
// @access  Public
export const logAntiCheatWarning = async (req, res, next) => {
  try {
    const { studentId, eventId, warningCount, reason } = req.body;

    await Log.create({
      action: `ANTI_CHEAT_WARNING_${warningCount}`,
      category: 'ANTI_CHEAT',
      userId: studentId,
      userType: 'Student',
      ipAddress: req.ip,
      details: { eventId, warningCount, reason, timestamp: new Date() },
    });

    // Notify admin live monitors if socket.io is active
    if (req.io && eventId) {
      req.io.to(`event_${eventId}`).emit('anti_cheat_alert', {
        studentId,
        eventId,
        warningCount,
        reason,
      });
    }

    res.status(200).json({
      success: true,
      message: `Anti-cheat warning ${warningCount} recorded`,
    });
  } catch (error) {
    next(error);
  }
};
