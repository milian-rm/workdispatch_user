'use strict';

/**
 * MIDDLEWARE DE DESARROLLO (MOCK JWT)
 * Este archivo permite probar los controladores sin necesidad de enviar un token real.
 * Inyecta un usuario simulado directamente en el request.
 */
export const validateJWT = async (req, res, next) => {
    
    
    req.user = { 
        _id: '65e8a1b2c3d4e5f67890abcd', 
        Role: 'WORKER' // Cambia a 'WORKER' cuando pruebes las habilidades del trabajador
    }; 

    console.log(`[MOCK AUTH] Usuario autenticado automáticamente como: ${req.user.Role}`);
    next();
};

/**
 * Verifica si el usuario simulado es CLIENT
 */
export const isClient = (req, res, next) => {
    if (!req.user || req.user.Role !== 'CLIENT') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado: Se requiere rol de Cliente (Mock Mode)' 
        });
    }
    next();
};

/**
 * Verifica si el usuario simulado es WORKER
 */
export const isWorker = (req, res, next) => {
    if (!req.user || req.user.Role !== 'WORKER') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado: Se requiere rol de Trabajador (Mock Mode)' 
        });
    }
    next();
};