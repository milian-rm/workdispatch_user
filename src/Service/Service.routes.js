'use strict';

import { Router } from 'express';
import { getServiceStatus, getServicesByWorker, getServicesByClient, finishService, cancelService, scheduleService, toggleWorkPlanDay, setupPlan, addWorkLog, editWorkLog, completeWorkDay, verifyWorkDay } from './Service.controller.js';
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

// WORKER: Configurar plan de trabajo (fechas estimadas + plan general).
api.patch('/setup-plan/:id', validateJWT, requireVerification, [validateServiceId], setupPlan);

// WORKER: Agregar entrada diaria al workPlan.
api.post('/work-log/:id', validateJWT, requireVerification, [validateServiceId], addWorkLog);

// WORKER: Editar descripción de un día PENDING.
api.patch('/work-log/:id/:dayNumber', validateJWT, requireVerification, [validateServiceId], editWorkLog);

// WORKER: Marcar día como completado.
api.patch('/complete-day/:id/:dayNumber', validateJWT, requireVerification, [validateServiceId], completeWorkDay);

// CLIENTE: Verificar o disputar un día completado.
api.patch('/verify-day/:id/:dayNumber', validateJWT, requireVerification, [validateServiceId], verifyWorkDay);

export default api;
