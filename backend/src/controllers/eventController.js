import { Event } from '../models/Event.js';
import { Student } from '../models/Student.js';
import { Log } from '../models/Log.js';
import { generateEventCode } from '../utils/generateEventCode.js';

// Helper to construct dynamic Vercel student join URL
const getJoinUrl = (eventCode) => {
  const baseUrl = process.env.CLIENT_STUDENT_URL || 'https://typing-student.vercel.app';
  return `${baseUrl.replace(/\/$/, '')}/register/${eventCode}`;
};

// @desc    Get currently active event (for Permanent Dashboard QR Card & Student Flow)
// @route   GET /api/v1/events/active & GET /api/events/active
// @access  Public
export const getActiveEvent = async (req, res, next) => {
  try {
    let event = await Event.findOne({
      status: { $in: ['Active', 'active'] },
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .select('-createdBy');

    if (!event) {
      event = await Event.findOne({ isDeleted: false })
        .sort({ createdAt: -1 })
        .select('-createdBy');
    }

    if (!event) {
      return res.status(200).json({
        success: true,
        event: null,
        message: 'No competition events created yet.',
      });
    }

    const participantCount = await Student.countDocuments({
      eventId: event._id,
      isDeleted: false,
    });

    const obj = event.toObject();
    obj.joinUrl = getJoinUrl(event.eventCode);
    obj.participantCount = participantCount;

    res.status(200).json({
      success: true,
      event: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/v1/events & POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res, next) => {
  try {
    const { title, duration, difficulty, paragraphIds, startDate, endDate, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Event title is required',
      });
    }

    const eventCode = await generateEventCode();
    const joinUrl = getJoinUrl(eventCode);

    const event = await Event.create({
      title: title.trim(),
      eventCode,
      joinUrl,
      qrGenerated: true,
      duration: duration || 60,
      difficulty: difficulty || 'Medium',
      paragraphIds: paragraphIds || [],
      startDate: startDate || new Date(),
      endDate: endDate || null,
      createdBy: req.admin?._id,
      status: status || 'Active',
    });

    await Log.create({
      action: 'EVENT_CREATED',
      category: 'EVENT',
      userId: req.admin?._id,
      userType: 'Admin',
      details: { eventId: event._id, eventCode, title, joinUrl },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: {
        ...event.toObject(),
        participantCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events
// @route   GET /api/v1/events & GET /api/events
// @access  Private (Admin)
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isDeleted: false })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const participantCount = await Student.countDocuments({
          eventId: ev._id,
          isDeleted: false,
        });
        const obj = ev.toObject();
        obj.joinUrl = getJoinUrl(ev.eventCode);
        obj.participantCount = participantCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event by ID
// @route   GET /api/v1/events/:id & GET /api/events/:id
// @access  Private (Admin)
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false })
      .populate('createdBy', 'username email')
      .populate('paragraphIds');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const participantCount = await Student.countDocuments({
      eventId: event._id,
      isDeleted: false,
    });

    const obj = event.toObject();
    obj.joinUrl = getJoinUrl(event.eventCode);
    obj.participantCount = participantCount;

    res.status(200).json({
      success: true,
      event: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active/upcoming/ended event details by event code
// @route   GET /api/v1/events/code/:code & GET /api/events/code/:code
// @access  Public
export const getEventByCode = async (req, res, next) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const event = await Event.findOne({
      eventCode: cleanCode,
      isDeleted: false,
    }).select('-createdBy');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found. Invalid event code.',
      });
    }

    const participantCount = await Student.countDocuments({
      eventId: event._id,
      isDeleted: false,
    });

    const obj = event.toObject();
    obj.joinUrl = getJoinUrl(event.eventCode);
    obj.participantCount = participantCount;

    res.status(200).json({
      success: true,
      event: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/v1/events/:id & PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req, res, next) => {
  try {
    const { title, duration, difficulty, paragraphIds, status, startDate, endDate } = req.body;

    let event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (title) event.title = title.trim();
    if (duration) event.duration = duration;
    if (difficulty) event.difficulty = difficulty;
    if (paragraphIds) event.paragraphIds = paragraphIds;
    if (status) event.status = status;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;

    await event.save();

    await Log.create({
      action: 'EVENT_UPDATED',
      category: 'EVENT',
      userId: req.admin?._id,
      userType: 'Admin',
      details: { eventId: event._id, title: event.title, status: event.status },
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle event status (Upcoming / Active / Ended)
// @route   PATCH /api/v1/events/:id/status
// @access  Private (Admin)
export const toggleEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Upcoming', 'Active', 'Ended', 'draft', 'scheduled', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = status;
    if ((status === 'Active' || status === 'active') && !event.startDate) {
      event.startDate = new Date();
    } else if ((status === 'Ended' || status === 'completed') && !event.endDate) {
      event.endDate = new Date();
    }

    await event.save();

    if (req.io) {
      req.io.to(`event_${event._id}`).emit('event_status_changed', {
        eventId: event._id,
        status: event.status,
      });
      req.io.emit('active_event_changed', {
        eventId: event._id,
        eventCode: event.eventCode,
        status: event.status,
      });
    }

    await Log.create({
      action: `EVENT_STATUS_${status.toUpperCase()}`,
      category: 'EVENT',
      userId: req.admin?._id,
      userType: 'Admin',
      details: { eventId: event._id, status },
    });

    res.status(200).json({
      success: true,
      message: `Event status updated to ${status}`,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete an event
// @route   DELETE /api/v1/events/:id & DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: false });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    await event.save();

    await Log.create({
      action: 'EVENT_DELETED',
      category: 'EVENT',
      userId: req.admin?._id,
      userType: 'Admin',
      details: { eventId: event._id, eventCode: event.eventCode },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
