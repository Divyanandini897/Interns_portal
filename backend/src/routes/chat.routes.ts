import { Router } from 'express';
import { getConversations, getMessages, createConversation, sendMessage } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);

export default router;
