'use strict';

import { Router } from 'express';
import { getServiceStatus, getServicesByWorker, getServicesByClient, finishService, cancelService, scheduleService, toggleWorkPlanDay } from './Service.controller.js';
import { validateServiceId } from '../../middlewares/service.validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { requireVerification } from '../../middlewares/require-verification.js';

const api = Router();

// WORKER: Ver servicios asignados.
api.get('/worker/:workerId', getServicesByWorker);

// CLIENT: Ver servicios donde es cliente.
api.get('/client/:clientId', getServicesByClient);

// CLIENT: Ver estado del servicio.
api.get('/:id', [validateServiceId], getServiceStatus);

// WORKER: Marcar trabajo como terminado.
api.patch('/complete/:id', validateJWT, requireVerification, [validateServiceId], finishService);

// CLIENT / WORKER: Cancelar servicio.
api.patch('/cancel/:id', validateJWT, requireVerification, [validateServiceId], cancelService);

// WORKER: Programar cita y plan de trabajo.
api.patch('/schedule/:id', validateJWT, requireVerification, [validateServiceId], scheduleService);

// WORKER: Marcar día del plan como completado/pendiente.
api.patch('/work-plan/:id/:dayNumber', validateJWT, requireVerification, [validateServiceId], toggleWorkPlanDay);

export default api;
