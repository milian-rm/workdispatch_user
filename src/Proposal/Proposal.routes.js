'use strict';

import { Router } from 'express';
import { 
    createProposal, 
    updateProposal, 
    cancelProposal, 
    getProposalsByServiceRequest, 
    acceptProposal, 
    rejectProposal 
} from './Proposal.controller.js';

const api = Router();

// Acciones que el documento asigna al WORKER 
api.post('/', createProposal);
api.put('/:id', updateProposal);
api.patch('/:id', cancelProposal);

// Acción que el documento asigna al CLIENT
api.get('/requests/:serviceRequestId', getProposalsByServiceRequest);
api.patch('/accept/:id', acceptProposal);
api.patch('/reject/:id', rejectProposal);

export default api;