
import { Router } from 'express';
import { 
    addUserSkill, 
    updateUserSkill, 
    getMySkills, 
    getWorkerSkills 
} from './userSkill.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

// WORKER: Gestionar sus propias habilidades
router.post('/', [validateJWT], addUserSkill);
router.put('/:id', [validateJWT], updateUserSkill);
router.get('/my-skills', [validateJWT], getMySkills);

// CLIENT: Ver habilidades de un trabajador específico por su ID
router.get('/worker/:userId', [validateJWT], getWorkerSkills);

export default router;