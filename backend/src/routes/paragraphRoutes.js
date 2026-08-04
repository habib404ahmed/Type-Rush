import express from 'express';
import {
  getRandomParagraph,
  getAllParagraphs,
  createParagraph,
  updateParagraph,
  deleteParagraph,
  bulkImportParagraphs,
} from '../controllers/paragraphController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for typing arena
router.get('/random', getRandomParagraph);

// Protected Admin Routes
router.use(protectAdmin);
router.route('/').get(getAllParagraphs).post(createParagraph);
router.post('/bulk-import', bulkImportParagraphs);
router.route('/:id').put(updateParagraph).delete(deleteParagraph);

export default router;
