'use strict';

import { Router } from 'express';
import { 
    createProposal, 
    updateProposal, 
    cancelProposal, 
    getProposalsByWorker,
    getProposalsByServiceRequest, 
    acceptProposal, 
    rejectProposal 
} from './Proposal.controller.js';
import { 
    validateProposal, 
    validateProposalId, 
    validateServiceRequestId 
} from '../../middlewares/proposal.validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const api = Router();

// Acciones del WORKER
api.post('/', [validateProposal], createProposal);
api.get('/worker/:workerId', getProposalsByWorker);
api.put('/:id', [validateProposalId, validateProposal], updateProposal);
api.patch('/cancel/:id', [validateProposalId], cancelProposal);

// Acciones del CLIENT
api.get('/requests/:serviceRequestId', validateJWT, [validateServiceRequestId], getProposalsByServiceRequest);
api.patch('/accept/:id', validateJWT, [validateProposalId], acceptProposal);
api.patch('/reject/:id', validateJWT, [validateProposalId], rejectProposal);

export default api;
