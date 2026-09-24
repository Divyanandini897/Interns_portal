import { Router } from 'express';
import { getTeams, getTeamById, createTeam, updateTeam, addTeamMember, removeTeamMember } from '../controllers/team.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', requireRole('ADMIN'), createTeam);
router.put('/:id', requireRole('ADMIN'), updateTeam);
router.post('/:id/members', requireRole('ADMIN'), addTeamMember);
router.delete('/:id/members/:userId', requireRole('ADMIN'), removeTeamMember);

export default router;
