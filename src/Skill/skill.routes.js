
import { Router } from 'express';
import { getSkills } from './skill.controller.js';

const router = Router();
// CLIENT y WORKER: Ver Skills disponibles
router.get('/', getSkills);

export default router;