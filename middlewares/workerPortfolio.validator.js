'use strict';

import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateWorkerPortfolio = [
    body('workerId')
        .notEmpty().withMessage('El ID del trabajador es requerido')
        .isMongoId().withMessage('El ID del trabajador no es un formato válido de MongoDB'),

    body('description')
        .trim()
        .notEmpty().withMessage('La descripción del trabajo es requerida')
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres'),

    checkValidators
];

export const validatePortfolioId = [
    param('id').isMongoId().withMessage('El ID del registro no es un formato válido de MongoDB'),
    checkValidators
];

export const validateWorkerIdParam = [
    param('workerId').isMongoId().withMessage('El ID del trabajador no es un formato válido de MongoDB'),
    checkValidators
];