import { Router } from 'express';
import { getEstimate } from './ai.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();
router.post('/estimate', validateJWT, getEstimate);
export default router;
