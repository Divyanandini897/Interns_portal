import { Router } from 'express';
import { getUsers, getUserById, createIntern, updateUser, updateUserStatus } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/interns', requireRole('ADMIN'), createIntern);
router.put('/:id', updateUser);
router.patch('/:id/status', requireRole('ADMIN'), updateUserStatus);

export default router;
