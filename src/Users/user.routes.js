import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    getProfileByEmail,
    getAllUsers           
} from './user.controller.js';
import { uploadUserProfileImage } from '../../middlewares/file-uploader.js';
import {
    validateCreateUser,
    validateLoginUser,
    validateUpdateUser,
    validateUserIdParam
} from '../../middlewares/user-validator.js';

const router = Router();

router.get('/', getAllUsers);                                // ← nuevo, antes de las demás
router.post('/register', uploadUserProfileImage.single('profilePhoto'), validateCreateUser, register);
router.post('/login', validateLoginUser, login);
router.get('/by-email/:email', getProfileByEmail);  // ← PRIMERO
router.get('/:id', validateUserIdParam, getProfile); // ← DESPUÉS
router.put('/:id', uploadUserProfileImage.single('profilePhoto'), validateUpdateUser, updateProfile);

export default router;