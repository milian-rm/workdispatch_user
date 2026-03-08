
import { Router } from 'express';
import { 
    createServiceRequest, 
    updateServiceRequest, 
    cancelServiceRequest, 
    getOpenRequests 
} from './serviceRequest.controller.js';
// Imports de validadores
import { validateCreateServiceRequest, validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';

const router = Router();

// CLIENTE: Crear, Editar y Cancelar
router.post('/', [validateCreateServiceRequest], createServiceRequest);
router.put('/:id', [validateServiceRequestId, validateCreateServiceRequest], updateServiceRequest);
router.patch('/cancel/:id', [validateServiceRequestId], cancelServiceRequest);

// WORKER: Ver disponibles
router.get('/open', getOpenRequests);

export default router;