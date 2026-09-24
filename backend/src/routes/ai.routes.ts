import { Router } from 'express';
import { getAiConversations, askAi } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/conversations', getAiConversations);
router.post('/ask', askAi);

export default router;
