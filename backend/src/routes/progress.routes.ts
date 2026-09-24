import { Router } from 'express';
import { getProgressUpdates, createProgressUpdate, reviewProgressUpdate } from '../controllers/progress.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getProgressUpdates);
router.post('/', createProgressUpdate);
router.patch('/:id/review', requireRole('ADMIN'), reviewProgressUpdate);

export default router;
