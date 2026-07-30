'use strict';

import { Router } from 'express';
import { 
    createProposal, 
    updateProposal, 
    cancelProposal, 
    getProposalById,
    getProposalsByWorker,
    getProposalsByServiceRequest, 
    acceptProposal, 
    rejectProposal 
} from './Proposal.controller.js';
import { 
    validateProposal, 
    validateProposalId, 
    validateServiceRequestId,
    validateRejectProposal
} from '../../middlewares/proposal.validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { requireVerification } from '../../middlewares/require-verification.js';

const api = Router();

// Acciones del WORKER
api.post('/', validateJWT, [validateProposal], requireVerification, createProposal);
api.get('/worker/:workerId', validateJWT, getProposalsByWorker);
api.get('/:id', validateJWT, getProposalById);
api.put('/:id', validateJWT, [validateProposalId, validateProposal], updateProposal);
api.patch('/cancel/:id', validateJWT, [validateProposalId], cancelProposal);

// Acciones del CLIENT
api.get('/requests/:serviceRequestId', validateJWT, [validateServiceRequestId], getProposalsByServiceRequest);
api.patch('/accept/:id', validateJWT, requireVerification, [validateProposalId], acceptProposal);
api.patch('/reject/:id', validateJWT, requireVerification, [validateRejectProposal], rejectProposal);

export default api;
