
import { Router } from 'express';
import { 
    createServiceRequest, 
    updateServiceRequest, 
    cancelServiceRequest, 
    getOpenRequests 
} from './serviceRequest.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
// Imports de validadores
import { validateCreateServiceRequest, validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';

const router = Router();

// CLIENTE: Crear, Editar y Cancelar
router.post('/', [validateJWT, validateCreateServiceRequest], createServiceRequest);
router.put('/:id', [validateJWT, validateServiceRequestId, validateCreateServiceRequest], updateServiceRequest);
router.patch('/cancel/:id', [validateJWT, validateServiceRequestId], cancelServiceRequest);

// WORKER: Ver disponibles
router.get('/open', [validateJWT], getOpenRequests);

export default router;