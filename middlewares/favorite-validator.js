import { body, param } from 'express-validator';
import { checkValidators } from '../middlewares/check.validators.js';

export const validateAddFavorite = [
    body('clientId', 'El ID del cliente es obligatorio y debe ser un MongoID válido').isMongoId(),
    body('workerId', 'El ID del trabajador es obligatorio y debe ser un MongoID válido').isMongoId(),
    checkValidators
];

export const validateFavoriteParams = [
    param('clientId', 'El ID del cliente es obligatorio y debe ser un MongoID válido').isMongoId(),
    param('workerId', 'El ID del trabajador es obligatorio y debe ser un MongoID válido').isMongoId(),
    checkValidators
];
