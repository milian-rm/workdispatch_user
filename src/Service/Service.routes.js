'use strict';

import { Router } from 'express';
import { getServiceStatus, finishService } from './Service.controller.js';
import { validateServiceId } from '../../middlewares/service.validator.js';

const api = Router();

// Acción que el documento asigna al CLIENT
api.get('/:id', [validateServiceId], getServiceStatus);

// Acciones que el documento asigna al WORKER 
api.patch('/complete/:id', [validateServiceId], finishService);

export default api;