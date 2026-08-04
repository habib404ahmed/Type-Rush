import express from 'express';
import { getAnalyticsCharts, getExportData } from '../controllers/analyticsController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);
router.get('/charts', getAnalyticsCharts);
router.get('/export', getExportData);

export default router;
