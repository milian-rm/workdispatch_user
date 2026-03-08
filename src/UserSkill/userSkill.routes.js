import { Router } from 'express';
import { 
    addUserSkill, 
    updateUserSkill, 
    getMySkills, 
    getWorkerSkills 
} from './userSkill.controller.js';
// Imports de validadores
import { validateAddUserSkill, validateUserSkillId } from '../../middlewares/userSkill-validator.js';
const router = Router();

// WORKER: Gestionar sus propias habilidades
router.post('/', [validateAddUserSkill], addUserSkill);
router.put('/:id', validateUserSkillId, updateUserSkill);
router.get('/:id', getMySkills);

// CLIENT: Ver habilidades de un trabajador específico por su ID
router.get('/worker/:userId', getWorkerSkills);
export default router;