
import { Router } from 'express';
import { 
    createServiceRequest, 
    updateServiceRequest, 
    cancelServiceRequest, 
    getOpenRequests 
} from './serviceRequest.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

// CLIENTE: Crear, Editar y Cancelar
router.post('/', [validateJWT], createServiceRequest);
router.put('/:id', [validateJWT], updateServiceRequest);
router.patch('/cancel/:id', [validateJWT], cancelServiceRequest); // Patch para cancelación lógica

// WORKER: Ver disponibles (y filtrar por categoría vía Query Params)
router.get('/open', [validateJWT], getOpenRequests);

export default router;