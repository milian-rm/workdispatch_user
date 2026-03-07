import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile
} from './user.controller.js';
import { uploadUserProfileImage } from '../../middlewares/file-uploader.js';
import {
    validateCreateUser,
    validateLoginUser,
    validateUpdateUser,
    validateUserIdParam
} from '../../middlewares/user-validator.js';

const router = Router();

router.post('/register', uploadUserProfileImage.single('profilePhoto'), validateCreateUser, register);
router.post('/login', validateLoginUser, login);
router.get('/:id', validateUserIdParam, getProfile);
router.put('/:id', uploadUserProfileImage.single('profilePhoto'), validateUpdateUser, updateProfile);

export default router;