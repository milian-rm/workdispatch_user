
import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const validateAddUserSkill = [
    body('skillId')
        .notEmpty().withMessage('El ID de la habilidad (Skill) es requerido')
        .isMongoId().withMessage('Debe ser un ID válido de MongoDB'),
    
    body('experienceYears')
        .notEmpty().withMessage('Los años de experiencia son requeridos')
        .isNumeric().withMessage('La experiencia debe ser un valor numérico')
        .isInt({ min: 0 }).withMessage('Los años de experiencia no pueden ser negativos'),
        
    checkValidators
];

export const validateUserSkillId = [
    param('id')
        .isMongoId().withMessage('El ID del UserSkill no es un formato válido de MongoDB.'),
    checkValidators
];