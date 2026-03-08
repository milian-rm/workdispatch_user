import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

const userRoles = ['CLIENT', 'WORKER', 'ADMIN'];

export const validateCreateUser = [

    body('firstName')
        .notEmpty().withMessage('Nombre es obligatorio'),

    body('lastName')
        .notEmpty().withMessage('Apellido es obligatorio'),

    body('email')
        .notEmpty().withMessage('Email es requerido')
        .isEmail().withMessage('Formato de email inválido'),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),

    body('phone')
        .optional(),

    body('role')
        .optional()
        .isIn(userRoles).withMessage('Rol inválido'),

    body('profilePhoto')
        .optional(),

    body('description')
        .optional(),

    body('ratingAverage')
        .optional()
        .isFloat({ min: 1, max: 5 }).withMessage('El rating average debe estar entre 1 y 5'),

    body('verificationStatus')
        .optional(),

    body('latitude')
        .notEmpty().withMessage('Latitud es requerida'),

    body('longitude')
        .notEmpty().withMessage('Longitud es requerida'),

    body('address')
        .notEmpty().withMessage('Dirección es requerida'),

    checkValidators
];

export const validateUpdateUser = [

    param('id')
        .isMongoId().withMessage('ID User inválido'),

    body('firstName')
        .optional(),

    body('lastName')
        .optional(),

    body('email')
        .optional()
        .isEmail().withMessage('Formato de email inválido'),

    body('password')
        .optional(),

    body('phone')
        .optional(),

    body('role')
        .optional()
        .isIn(userRoles).withMessage('Rol inválido'),

    body('profilePhoto')
        .optional(),

    body('description')
        .optional(),

    body('ratingAverage')
        .optional()
        .isFloat({ min: 1, max: 5 }).withMessage('El rating average debe estar entre 1 y 5'),

    body('verificationStatus')
        .optional(),

    body('latitude')
        .optional(),

    body('longitude')
        .optional(),

    body('address')
        .optional(),

    checkValidators
];

export const validateUserIdParam = [
    param('id')
        .isMongoId().withMessage('ID User inválido'),
    checkValidators
];

export const validateLoginUser = [

    body('email')
        .notEmpty().withMessage('Email es requerido')
        .isEmail().withMessage('Formato de email inválido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password es requerido')
        .isString().withMessage('Password debe ser una cadena de texto'),

    checkValidators
];