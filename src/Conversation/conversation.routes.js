import { Router } from 'express';
import {
    createConversation,
    getUserConversations
} from './conversation.controller.js';

import {
    validateCreateConversation,
    validateGetUserConversations
}from '../../middlewares/conversation-validator.js'

const router = Router();

router.post('/', validateCreateConversation, createConversation);
router.get('/user/:userId', validateGetUserConversations, getUserConversations);

export default router;