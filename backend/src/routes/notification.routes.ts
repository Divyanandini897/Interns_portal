import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
