'use strict';

import { Router } from 'express';
import { getServiceStatus, finishService, cancelService } from './Service.controller.js';
import { validateServiceId } from '../../middlewares/service.validator.js';

const api = Router();

// Acción de CLIENT
api.get('/:id', [validateServiceId], getServiceStatus);

// Acciones de WORKER 
api.patch('/complete/:id', [validateServiceId], finishService);

// Accion para los 2
api.patch('/cancel/:id', [validateServiceId], cancelService);

export default api;