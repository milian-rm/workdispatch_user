'use strict';

import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

// Validación para crear o editar una propuesta
export const validateProposal = [
    body('serviceRequestId')
        .notEmpty().withMessage('El ID de la solicitud de servicio es requerido')
        .isMongoId().withMessage('El ID de la solicitud no es un formato de MongoDB válido'),

    body('workerId')
        .notEmpty().withMessage('El ID del trabajador es requerido')
        .isMongoId().withMessage('El ID del trabajador no es un formato de MongoDB válido'),

    body('price')
        .notEmpty().withMessage('El precio es requerido')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),

    body('message')
        .trim()
        .notEmpty().withMessage('El mensaje de la propuesta es requerido')
        .isLength({ max: 500 }).withMessage('El mensaje no puede exceder los 500 caracteres'),

    checkValidators
];

// Validación para parámetros de ID (usado en accept, reject, cancel, update)
export const validateProposalId = [
    param('id')
        .isMongoId().withMessage('El ID de la propuesta no es un formato de MongoDB válido'),
    checkValidators
];

// Validación para el parámetro de serviceRequestId (usado al listar)
export const validateServiceRequestId = [
    param('serviceRequestId')
        .isMongoId().withMessage('El ID de la solicitud no es un formato de MongoDB válido'),
    checkValidators
];