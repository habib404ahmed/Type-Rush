import express from 'express';
import { logAntiCheatWarning } from '../controllers/antiCheatController.js';

const router = express.Router();

router.post('/log-warning', logAntiCheatWarning);

export default router;
