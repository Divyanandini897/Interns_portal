import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTaskStatus, updateTask, deleteTask } from '../controllers/task.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', requireRole('ADMIN'), createTask);
router.patch('/:id/status', updateTaskStatus);
router.put('/:id', requireRole('ADMIN'), updateTask);
router.delete('/:id', requireRole('ADMIN'), deleteTask);

export default router;
