import { param } from 'express-validator';
import { checkValidators } from './check.validators.js'; 

export const getNotificationsValidator = [
    param('userId', 'El ID del usuario es obligatorio y debe ser un MongoID válido').isMongoId(),
    checkValidators
];