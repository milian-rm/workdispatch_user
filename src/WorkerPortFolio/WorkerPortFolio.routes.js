'use strict';

import { Router } from 'express';
import { 
    addRecord, 
    getMyPortfolio, 
    getPortfolioByWorker, 
    updateRecord, 
    changeStatus 
} from './WorkerPortFolio.controller.js';
import { 
    validateWorkerPortfolio, 
    validatePortfolioId, 
    validateWorkerIdParam 
} from '../../middlewares/workerPortfolio.validator.js';
const api = Router();

// Acciones de WORKER 
api.post('/', [validateWorkerPortfolio], addRecord);
api.get('/my/:workerId', [validateWorkerIdParam],  getMyPortfolio);
api.put('/:id', [validatePortfolioId, validateWorkerPortfolio], updateRecord);
api.patch('/status/:id', [validatePortfolioId], changeStatus);

// Acción de CLIENT
api.get('/:id', [validatePortfolioId], getPortfolioByWorker);

export default api;