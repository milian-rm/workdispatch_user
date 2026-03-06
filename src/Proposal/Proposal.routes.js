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
api.post('/create', [validateProposal], createProposal);
api.put('/update/:id', [validateProposalId, validateProposal], updateProposal);
api.patch('/cancel/:id', [validateProposalId], cancelProposal);

// Acciones del CLIENT
api.get('/service-request/:serviceRequestId', [validateServiceRequestId], getProposalsByServiceRequest);
api.patch('/accept/:id', [validateProposalId], acceptProposal);
api.patch('/reject/:id', [validateProposalId], rejectProposal);

export default api;