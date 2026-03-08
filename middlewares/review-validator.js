import { body, param } from 'express-validator';
// Mandamos a traer tu middleware exacto
import { checkValidators } from './check.validators.js'; 

export const createReviewValidator = [
    body('serviceId', 'El ID del servicio es obligatorio y debe ser un MongoID válido').isMongoId(),
    body('reviewerId', 'El ID de quien evalúa es obligatorio y debe ser un MongoID válido').isMongoId(),
    body('revieweredId', 'El ID del evaluado es obligatorio y debe ser un MongoID válido').isMongoId(),
    body('Rating', 'El rating debe ser un número entero entre 1 y 5').isInt({ min: 1, max: 5 }),
    body('Comment', 'El comentario es obligatorio').notEmpty(),
    checkValidators // Tu manejador de errores
];

export const editReviewValidator = [
    param('id', 'No es un ID de MongoDB válido').isMongoId(),
    body('Rating', 'El rating debe ser un número entero entre 1 y 5').optional().isInt({ min: 1, max: 5 }),
    body('Comment', 'El comentario no puede estar vacío').optional().notEmpty(),
    checkValidators
];

export const getReviewsValidator = [
    param('clientId', 'No es un ID de MongoDB válido').optional().isMongoId(),
    param('workerId', 'No es un ID de MongoDB válido').optional().isMongoId(),
    checkValidators
];