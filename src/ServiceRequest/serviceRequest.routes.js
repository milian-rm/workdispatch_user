
import { Router } from 'express';
import { 
    createServiceRequest, 
    updateServiceRequest, 
    cancelServiceRequest, 
    getOpenRequests 
} from './serviceRequest.controller.js';
// Imports de validadores
import { validateCreateServiceRequest, validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';
import { uploadServiceRequestImage } from '../../middlewares/file-uploader.js';
import { cleanupUploadedFileOnFinish, deleteFileOnError } from '../../middlewares/delete-file-on-error.js';

const router = Router();
const uploadServiceRequestPhoto = uploadServiceRequestImage.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// CLIENTE: Crear, Editar y Cancelar
router.post(
    '/',
    uploadServiceRequestPhoto,
    cleanupUploadedFileOnFinish,
    validateCreateServiceRequest,
    createServiceRequest,
    deleteFileOnError
);
router.put(
    '/:id',
    validateServiceRequestId,
    uploadServiceRequestPhoto,
    cleanupUploadedFileOnFinish,
    validateCreateServiceRequest,
    updateServiceRequest,
    deleteFileOnError
);
router.patch('/cancel/:id', [validateServiceRequestId], cancelServiceRequest);

// WORKER: Ver disponibles
router.get('/open', getOpenRequests);

export default router;
