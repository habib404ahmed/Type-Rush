import express from 'express';
import { loginAdmin, getMe } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, loginAdmin);
router.get('/me', protectAdmin, getMe);

export default router;
