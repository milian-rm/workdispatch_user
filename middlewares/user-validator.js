import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

const userRoles = ['CLIENT', 'WORKER', 'ADMIN'];

export const validateCreateUser = [
    body('firstName')
        .notEmpty().withMessage('Nombre es obligatorio')
        .matches(/^[a-zA-ZÀ-ÿñÑ\s]+$/).withMessage('Nombre solo puede contener letras'),

    body('lastName')
        .notEmpty().withMessage('Apellido es obligatorio')
        .matches(/^[a-zA-ZÀ-ÿñÑ\s]+$/).withMessage('Apellido solo puede contener letras'),

    body('email')
        .notEmpty().withMessage('Email es requerido')
        .isEmail().withMessage('Formato de email invalido'),

    body('password')
        .notEmpty().withMessage('La contrasena es obligatoria'),

    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Telefono contiene caracteres no validos'),

    body('role')
        .optional()
        .isIn(userRoles).withMessage('Rol invalido'),

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
        .optional({ nullable: true, checkFalsy: true })
        .isFloat().withMessage('Latitud debe ser numérica'),

    body('longitude')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat().withMessage('Longitud debe ser numérica'),

    body('address')
        .optional(),

    checkValidators
];

export const validateUpdateUser = [
    param('id')
        .isMongoId().withMessage('ID User invalido'),

    body('firstName')
        .optional()
        .matches(/^[a-zA-ZÀ-ÿñÑ\s]+$/).withMessage('Nombre solo puede contener letras'),

    body('lastName')
        .optional()
        .matches(/^[a-zA-ZÀ-ÿñÑ\s]+$/).withMessage('Apellido solo puede contener letras'),

    body('email')
        .optional()
        .isEmail().withMessage('Formato de email invalido'),

    body('password')
        .optional(),

    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Telefono contiene caracteres no validos'),

    body('role')
        .optional()
        .isIn(userRoles).withMessage('Rol invalido'),

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
        .optional({ nullable: true, checkFalsy: true })
        .isFloat().withMessage('Latitud debe ser numérica'),

    body('longitude')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat().withMessage('Longitud debe ser numérica'),

    body('address')
        .optional(),

    checkValidators
];

export const validateUserIdParam = [
    param('id')
        .isMongoId().withMessage('ID User invalido'),
    checkValidators
];

export const validateLoginUser = [
    body('email')
        .notEmpty().withMessage('Email es requerido')
        .isEmail().withMessage('Formato de email invalido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password es requerido')
        .isString().withMessage('Password debe ser una cadena de texto'),

    checkValidators
];