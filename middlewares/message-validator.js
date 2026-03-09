import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateSendMessage = [

    body('conversationId')
        .notEmpty().withMessage('ConversationId es obligatorio')
        .isMongoId().withMessage('ConversationId inválido'),

    body('senderId')
        .notEmpty().withMessage('SenderId es obligatorio')
        .isMongoId().withMessage('SenderId inválido'),

    body('content')
        .notEmpty().withMessage('El contenido del mensaje es obligatorio')
        .isString().withMessage('El mensaje debe ser texto'),

    checkValidators
];

export const validateGetMessagesByConversation = [

    param('conversationId')
        .isMongoId().withMessage('ConversationId inválido'),

    checkValidators
];