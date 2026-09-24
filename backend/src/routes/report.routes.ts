import { Router } from 'express';
import { getDashboardReports } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', getDashboardReports);

export default router;
