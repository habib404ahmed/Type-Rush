import express from 'express';
import {
  submitResult,
  getEventLeaderboard,
  getStudentResult,
} from '../controllers/resultController.js';

const router = express.Router();

router.post('/submit', submitResult);
router.get('/leaderboard/:eventId', getEventLeaderboard);
router.get('/student/:studentId', getStudentResult);

export default router;
