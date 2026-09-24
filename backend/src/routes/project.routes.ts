import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject } from '../controllers/project.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireRole('ADMIN'), createProject);
router.put('/:id', requireRole('ADMIN'), updateProject);

export default router;
