import { Admin } from '../models/Admin.js';
import { Log } from '../models/Log.js';
import { generateToken } from '../utils/generateToken.js';

// Seed default admin helper
export const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultAdmin = await Admin.create({
        username: 'admin',
        email: 'admin@typerush.com',
        password: 'admin123',
        role: 'superadmin',
      });
      console.log(`[Auth Setup] Default admin created: admin@typerush.com / admin123`);
      await Log.create({
        action: 'SEED_ADMIN_CREATED',
        category: 'AUTH',
        userId: defaultAdmin._id,
        userType: 'Admin',
        details: { email: defaultAdmin.email },
      });
    }
  } catch (err) {
    console.warn(`[Auth Setup Warning] Could not seed admin: ${err.message}`);
  }
};

// @desc    Authenticate Admin & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Clean inputs
    const cleanEmail = email.trim().toLowerCase();

    // Check for admin
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account has been deactivated',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Log action
    await Log.create({
      action: 'ADMIN_LOGIN_SUCCESS',
      category: 'AUTH',
      userId: admin._id,
      userType: 'Admin',
      ipAddress: req.ip,
      details: { email: admin.email },
    });

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current Admin profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin,
  });
};
