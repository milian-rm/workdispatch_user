import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateCreateServiceRequest = [
    body('title') 
        .notEmpty().withMessage('El título es obligatorio')
        .isLength({ min: 10 }).withMessage('El título debe tener al menos 10 caracteres'),
    
    body('description') 
        .notEmpty().withMessage('La descripción es obligatoria'),
    
    body('categoryId')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isMongoId().withMessage('El ID de la categoría debe ser un formato válido de MongoDB'),
    
    body('latitude') 
        .notEmpty().withMessage('La latitud es obligatoria')
        .isFloat({ min: -90, max: 90 }).withMessage('La latitud debe estar entre -90 y 90'),
    
    body('longitude') 
        .notEmpty().withMessage('La longitud es obligatoria')
        .isFloat({ min: -180, max: 180 }).withMessage('La longitud debe estar entre -180 y 180'),
    
    body('address') 
        .notEmpty().withMessage('La dirección es obligatoria'),
    
    body('budgetMin')
        .notEmpty().withMessage('El presupuesto mínimo es obligatorio')
        .isFloat({ min: 0 }).withMessage('El presupuesto mínimo no puede ser negativo'),
    
    body('budgetMax')
        .notEmpty().withMessage('El presupuesto máximo es obligatorio')
        .isFloat({ min: 0 }).withMessage('El presupuesto máximo no puede ser negativo')
        .custom((value, { req }) => {
            if (parseFloat(value) < parseFloat(req.body.budgetMin)) {
                throw new Error('El presupuesto máximo no puede ser menor al presupuesto mínimo');
            }
            return true;
        }),
        
    checkValidators
];

export const validateServiceRequestId = [
    param('id')
        .isMongoId().withMessage('El ID de la solicitud no es un formato válido de MongoDB.'),
    checkValidators
];