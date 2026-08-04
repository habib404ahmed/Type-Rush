import { Student } from '../models/Student.js';
import { Event } from '../models/Event.js';
import { Log } from '../models/Log.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register student for a competition event
// @route   POST /api/v1/students/register
// @access  Public
export const registerStudent = async (req, res, next) => {
  try {
    let { name, rollNumber, department, eventCode, confirmation } = req.body;

    if (!name || !rollNumber || !department || !eventCode) {
      return res.status(400).json({
        success: false,
        message: 'All registration fields are required (Name, Roll Number, Department, Event Code)',
      });
    }

    if (!confirmation) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the competition rules and anti-cheat guidelines',
      });
    }

    // Clean inputs
    name = name.trim();
    rollNumber = rollNumber.trim().toUpperCase();
    department = department.trim();
    eventCode = eventCode.trim().toUpperCase();

    const allowedDepartments = ['MBA', 'BBA', 'BCA', 'B.Tech'];
    if (!allowedDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: `Invalid department. Allowed options: ${allowedDepartments.join(', ')}`,
      });
    }

    // Verify event existence and status
    const event = await Event.findOne({ eventCode, isDeleted: false });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Invalid event code. Event not found.',
      });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Registration closed. This event is ${event.status}.`,
      });
    }

    // Check duplicate roll number for this event
    const existingStudent = await Student.findOne({
      eventId: event._id,
      rollNumber,
      isDeleted: false,
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Roll Number '${rollNumber}' has already been registered for this event. Duplicate entries are not allowed.`,
      });
    }

    // Create student record
    const student = await Student.create({
      name,
      rollNumber,
      department,
      eventId: event._id,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'] || '',
    });

    // Notify live admin monitors via Socket.IO
    if (req.io) {
      req.io.to(`event_${event._id}`).emit('new_registration', {
        eventId: event._id,
        studentId: student._id,
        name: student.name,
        department: student.department,
      });
    }

    await Log.create({
      action: 'STUDENT_REGISTERED',
      category: 'STUDENT',
      userId: student._id,
      userType: 'Student',
      ipAddress: req.ip,
      details: { rollNumber, department, eventCode },
    });

    const token = generateToken(student._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Ready for typing test.',
      token,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        eventId: student.eventId,
      },
      event: {
        id: event._id,
        title: event.title,
        eventCode: event.eventCode,
        duration: event.duration,
        difficulty: event.difficulty,
        status: event.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile
// @route   GET /api/v1/students/me
// @access  Private (Student)
export const getStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.studentId)
      .populate('eventId', 'title eventCode duration difficulty status');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};
