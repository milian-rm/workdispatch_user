import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js'; 

export const createReportValidator = [
    body('reporterId', 'El ID de quien reporta es obligatorio y debe ser un MongoID válido').isMongoId(),
    body('reporteredId', 'El ID del usuario reportado es obligatorio y debe ser un MongoID válido').isMongoId(),
    body('Reason', 'La razón del reporte es obligatoria').notEmpty(),
    body('Description', 'La descripción es obligatoria').notEmpty(),
    checkValidators
];

export const getReportsValidator = [
    param('userId', 'El ID del usuario es obligatorio y debe ser un MongoID válido').isMongoId(),
    checkValidators
];