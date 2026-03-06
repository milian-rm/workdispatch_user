'use strict';

import { Router } from 'express';
import { 
    addRecord, 
    getMyPortfolio, 
    getPortfolioByWorker, 
    updateRecord, 
    deleteRecord 
} from './WorkerPortFolio.controller.js';
import { 
    validateWorkerPortfolio, 
    validatePortfolioId, 
    validateWorkerIdParam 
} from './workerPortfolio.validator.js';
const api = Router();

// Acciones que el documento asigna al WORKER 
api.post('/', [validateWorkerPortfolio], addRecord);
api.get('/my/:workerId', [validateWorkerIdParam],  getMyPortfolio); // Se pasa el ID del que "está logeado"
api.put('/:id', [validatePortfolioId, validateWorkerPortfolio], updateRecord);
api.delete('/:id', [validatePortfolioId], deleteRecord);

// Acción que el documento asigna al CLIENT [cite: 201]
api.get('/:id', [validatePortfolioId], getPortfolioByWorker);

export default api;