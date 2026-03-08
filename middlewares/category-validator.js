import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateCategoryIdParam = [
    param('id')
        .isMongoId().withMessage('ID de categoría inválido'),
    checkValidators
];