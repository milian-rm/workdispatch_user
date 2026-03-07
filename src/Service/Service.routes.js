'use strict';

import { Router } from 'express';
import { getServiceStatus, finishService } from './Service.controller.js';
import { validateServiceId } from '../../middlewares/service.validator.js';

const api = Router();

// Acción de CLIENT
api.get('/:id', [validateServiceId], getServiceStatus);

// Acciones de WORKER 
api.patch('/complete/:id', [validateServiceId], finishService);

export default api;