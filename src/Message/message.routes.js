import { Router } from 'express';
import {
    sendMessage,
    getMessagesByConversation
} from './message.controller.js';

const router = Router();

router.post('/', sendMessage);
router.get('/conversation/:conversationId', getMessagesByConversation);

export default router;