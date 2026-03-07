import { Router } from 'express';
import {
    createVerification,
    getVerificationById
} from './verification.controller.js';
import { uploadVerificationImage } from '../../middlewares/file-uploader.js';

const router = Router();

router.post('/',
    uploadVerificationImage.fields([
        { name: 'documentImageFront', maxCount: 1 },
        { name: 'documentImageBack', maxCount: 1 }
    ]),
    createVerification);
router.get('/:id', getVerificationById);

export default router;