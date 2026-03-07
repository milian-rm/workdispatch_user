import { Router } from 'express';
import {
    createVerification,
    getVerificationById
} from './verification.controller.js';
import { uploadVerificationImage } from '../../middlewares/file-uploader.js';
import { validateCreateVerification, validateVerificationIdParam } from '../../middlewares/verification-validator.js';

const router = Router();

router.post('/',
    uploadVerificationImage.fields([
        { name: 'documentImageFront', maxCount: 1 },
        { name: 'documentImageBack', maxCount: 1 }
    ]),
    validateCreateVerification,
    createVerification);
router.get('/:id', validateVerificationIdParam, getVerificationById);

export default router;