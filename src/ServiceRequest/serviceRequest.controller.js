'use strict';

import ServiceRequest from './serviceRequest.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

const getUploadedServiceRequestImage = (req) => {
    if (req.file) return req.file;
    if (!req.files) return null;

    return req.files.serviceImage?.[0]
        || req.files.image?.[0]
        || req.files.photo?.[0]
        || null;
};

const applyUploadedImage = (data, req) => {
    const image = getUploadedServiceRequestImage(req);

    if (image) {
        data.serviceImage = {
            url: image.path,
            public_id: image.filename
        };
    }
};

// CLIENT: Crear solicitud 
export const createServiceRequest = async (req, res) => {
    try {
        const data = { ...req.body };
        applyUploadedImage(data, req);

        const serviceRequest = new ServiceRequest(data);
        await serviceRequest.save();

        res.status(201).json({ success: true, message: 'Solicitud creada', data: serviceRequest });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear', error: error.message });
    }
};

// CLIENT: Editar solicitud 
export const updateServiceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        applyUploadedImage(data, req);

        const currentRequest = await ServiceRequest.findOne({ _id: id, clientId: req.user._id });
        
        const updated = await ServiceRequest.findOneAndUpdate(
            { _id: id, clientId: req.user._id }, 
            data, 
            { new: true }
        );

        const previousPublicId = currentRequest?.serviceImage?.public_id;
        const newPublicId = data.serviceImage?.public_id;

        if (updated && previousPublicId && newPublicId && previousPublicId !== newPublicId) {
            await cloudinary.uploader.destroy(previousPublicId);
        }
        
        if (!updated) return res.status(404).json({ success: false, message: 'Solicitud no encontrada o no tienes permiso' });
        res.status(200).json({ success: true, message: 'Solicitud actualizada', data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al actualizar', error: error.message });
    }
};

// CLIENT: Cancelar solicitud (Cambio de Status) 
export const cancelServiceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const cancelled = await ServiceRequest.findOneAndUpdate(
            { _id: id, clientId: req.user._id },
            { status: 'CANCELLED' },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Solicitud cancelada', data: cancelled });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// WORKER: Ver solicitudes abiertas (Solo las que están activas)
export const getOpenRequests = async (req, res) => {
    try {
        const { categoryId } = req.query;
        
        // Agregamos isActive: true al filtro
        const filter = { status: 'OPEN', isActive: true }; 
        
        if (categoryId) filter.categoryId = categoryId;

        const requests = await ServiceRequest.find(filter)
            .populate('clientId', 'firstName lastName profilePhoto')
            .populate('categoryId', 'name');

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
