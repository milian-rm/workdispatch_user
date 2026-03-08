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
import { 
    validateProposal, 
    validateProposalId, 
    validateServiceRequestId 
} from '../../middlewares/proposal.validator.js';

const api = Router();

// Acciones del WORKER
api.post('/', [validateProposal], createProposal);
api.put('/:id', [validateProposalId, validateProposal], updateProposal);
api.patch('/cancel/:id', [validateProposalId], cancelProposal);

// Acciones del CLIENT
api.get('/requests/:serviceRequestId', [validateServiceRequestId], getProposalsByServiceRequest);
api.patch('/accept/:id', [validateProposalId], acceptProposal);
api.patch('/reject/:id', [validateProposalId], rejectProposal);

export default api;