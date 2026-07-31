import { Router } from 'express';
import {
    register,
    login,
    refresh,
    getProfile,
    updateProfile,
    getProfileByEmail,
    getAllUsers,
    getTrustStats,
    getClientTrustStats
} from './user.controller.js';
import { uploadUserProfileImage } from '../../middlewares/file-uploader.js';
import {
    validateCreateUser,
    validateLoginUser,
    validateUpdateUser,
    validateUserIdParam
} from '../../middlewares/user-validator.js';

const router = Router();

router.get('/', getAllUsers);
router.post('/register', uploadUserProfileImage.single('profilePhoto'), validateCreateUser, register);
router.post('/login', validateLoginUser, login);
router.post('/refresh', refresh);
router.get('/by-email/:email', getProfileByEmail);
router.get('/:id/trust-stats', validateUserIdParam, getTrustStats);
router.get('/:id/client-trust-stats', validateUserIdParam, getClientTrustStats);
router.get('/:id', validateUserIdParam, getProfile);
router.put('/:id', uploadUserProfileImage.single('profilePhoto'), validateUpdateUser, updateProfile);

export default router;
