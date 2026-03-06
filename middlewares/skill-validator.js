
import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateCreateSkill = [
    body('Name')
        .notEmpty().withMessage('El nombre de la habilidad es requerido')
        .isLength({ max: 50 }).withMessage('El nombre no puede exceder los 50 caracteres'),
    
    body('categoryId')
        .notEmpty().withMessage('El ID de la categoría es obligatorio')
        .isMongoId().withMessage('Debe ser un ID válido de MongoDB'),
        
    checkValidators
];

export const validateSkillId = [
    param('id')
        .isMongoId().withMessage('El ID de la habilidad no es un formato válido de MongoDB.'),
    checkValidators
];