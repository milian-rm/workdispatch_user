import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateCreateConversation = [

    body('user1Id')
        .notEmpty().withMessage('User1Id es obligatorio')
        .isMongoId().withMessage('User1Id inválido'),

    body('user2Id')
        .notEmpty().withMessage('User2Id es obligatorio')
        .isMongoId().withMessage('User2Id inválido'),

    checkValidators
];

export const validateGetUserConversations = [

    param('userId')
        .isMongoId().withMessage('ID de usuario inválido'),

    checkValidators
];