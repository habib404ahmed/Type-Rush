import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getEventByCode,
  getActiveEvent,
  updateEvent,
  toggleEventStatus,
  deleteEvent,
} from '../controllers/eventController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for student join lookup & active QR lookup
router.get('/active', getActiveEvent);
router.get('/code/:code', getEventByCode);

// Protected Admin Routes
router.use(protectAdmin);
router.route('/').get(getEvents).post(createEvent);
router.route('/:id').get(getEventById).put(updateEvent).delete(deleteEvent);
router.patch('/:id/status', toggleEventStatus);

export default router;
