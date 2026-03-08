
import { Router } from 'express';
import { getSkills } from './skill.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();
// CLIENT y WORKER: Ver Skills disponibles
router.get('/', [validateJWT], getSkills);

export default router;