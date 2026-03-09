import { Router } from 'express';
import {
    sendMessage,
    getMessagesByConversation
} from './message.controller.js';

import{
    validateGetMessagesByConversation,
    validateSendMessage
} from '../../middlewares/message-validator.js'
const router = Router();

router.post('/', validateSendMessage, sendMessage);
router.get('/conversation/:conversationId', validateGetMessagesByConversation, getMessagesByConversation);

export default router;