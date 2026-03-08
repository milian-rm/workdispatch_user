import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateCreateVerification = [

    body('userId')
        .notEmpty().withMessage('El userId es obligatorio')
        .isMongoId().withMessage('El userId no es válido'),

    body('documentType')
        .notEmpty().withMessage('El tipo de documento es obligatorio')
        .isString().withMessage('El tipo de documento debe ser texto'),

    body('documentNumber')
        .notEmpty().withMessage('El número de documento es obligatorio')
        .isString().withMessage('El número de documento debe ser texto'),

    checkValidators
];

export const validateVerificationIdParam = [
    param('id')
        .isMongoId().withMessage('ID de verificación inválido'),
    checkValidators
];