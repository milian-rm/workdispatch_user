'use strict';

import { Router } from 'express';
import { 
    addRecord, 
    getMyPortfolio, 
    getPortfolioByWorker, 
    updateRecord, 
    deleteRecord 
} from './WorkerPortFolio.controller.js';

const api = Router();

// Acciones que el documento asigna al WORKER 
api.post('/', addRecord);
api.get('/my/:workerId', getMyPortfolio); // Se pasa el ID del que "está logeado"
api.put('/:id', updateRecord);
api.delete('/:id', deleteRecord);

// Acción que el documento asigna al CLIENT [cite: 201]
api.get('/:id', getPortfolioByWorker);

export default api;