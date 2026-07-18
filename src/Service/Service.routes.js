'use strict';

import { Router } from 'express';
import { getServiceStatus, getServicesByWorker, finishService, cancelService } from './Service.controller.js';
import { validateServiceId } from '../../middlewares/service.validator.js';

const api = Router();

// WORKER: Ver servicios asignados.
api.get('/worker/:workerId', getServicesByWorker);

// CLIENT: Ver estado del servicio.
api.get('/:id', [validateServiceId], getServiceStatus);

// WORKER: Marcar trabajo como terminado.
api.patch('/complete/:id', [validateServiceId], finishService);

// CLIENT / WORKER: Cancelar servicio.
api.patch('/cancel/:id', [validateServiceId], cancelService);

export default api;
