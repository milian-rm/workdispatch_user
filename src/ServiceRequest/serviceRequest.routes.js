
import { Router } from 'express';
import {
    createServiceRequest,
    updateServiceRequest,
    cancelServiceRequest,
    getOpenRequests,
    getMyServiceRequests,
    getServiceRequestById
} from './serviceRequest.controller.js';
// Imports de validadores
import { validateCreateServiceRequest, validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';
import { uploadServiceRequestImage } from '../../middlewares/file-uploader.js';
import { cleanupUploadedFileOnFinish, deleteFileOnError } from '../../middlewares/delete-file-on-error.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { requireVerification } from '../../middlewares/require-verification.js';

const router = Router();
const uploadServiceRequestPhoto = uploadServiceRequestImage.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// CLIENTE: Crear, Editar y Cancelar
router.post(
    '/',
    validateJWT,
    requireVerification,
    uploadServiceRequestPhoto,
    cleanupUploadedFileOnFinish,
    validateCreateServiceRequest,
    createServiceRequest,
    deleteFileOnError
);
router.put(
    '/:id',
    validateJWT,
    validateServiceRequestId,
    uploadServiceRequestPhoto,
    cleanupUploadedFileOnFinish,
    validateCreateServiceRequest,
    updateServiceRequest,
    deleteFileOnError
);
router.patch('/cancel/:id', validateJWT, [validateServiceRequestId], cancelServiceRequest);

// WORKER: Ver disponibles
router.get('/open', getOpenRequests);

// CLIENTE: Ver mis solicitudes y detalle
router.get('/mine', validateJWT, getMyServiceRequests);
router.get('/:id', validateJWT, validateServiceRequestId, getServiceRequestById);

export default router;
