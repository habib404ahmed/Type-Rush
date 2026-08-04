import express from 'express';
import { getDashboardStats, getParticipants } from '../controllers/dashboardController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);
router.get('/stats', getDashboardStats);
router.get('/participants', getParticipants);

export default router;
