import express from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import studentRoutes from './studentRoutes.js';
import paragraphRoutes from './paragraphRoutes.js';
import antiCheatRoutes from './antiCheatRoutes.js';
import resultRoutes from './resultRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { verifyModels } from '../controllers/testDbController.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/students', studentRoutes);
router.use('/paragraphs', paragraphRoutes);
router.use('/anti-cheat', antiCheatRoutes);
router.use('/results', resultRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.get('/test-db', verifyModels);









// Base API route ping
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Type Rush REST API v1',
    documentation: '/api/v1/health',
  });
});

export default router;

