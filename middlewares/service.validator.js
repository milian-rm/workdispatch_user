'use strict';

import { param } from 'express-validator';
import { checkValidators } from './check.validators.js'; 

export const validateServiceId = [
    param('id')
        .notEmpty().withMessage('El ID del servicio es requerido')
        .isMongoId().withMessage('El ID proporcionado no es un formato válido de MongoDB'),
    checkValidators
];