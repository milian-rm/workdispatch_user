'use strict';

import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile
} from './user.controller.js';
import { uploadUserProfileImage } from '../../middlewares/file-uploader.js';

const router = Router();

router.post('/register', uploadUserProfileImage.single('profilePhoto'), register);
router.post('/login', login);
router.get('/:id', getProfile);
router.put('/:id', uploadUserProfileImage.single('profilePhoto'), updateProfile);

export default router;