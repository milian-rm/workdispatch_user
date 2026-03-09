'use strict';

import Service from './Service.model.js';

/**
 * MÉTODO AUTOMÁTICO: Crear un servicio (Llamado desde proposal.controller.js)
 */
export const createServiceFromProposal = async (serviceData) => {
    try {
        const newService = new Service({
            requestId: serviceData.requestId,
            clientId: serviceData.clientId,
            workerId: serviceData.workerId,
            finalPrice: serviceData.price,
            status: 'IN_PROGRESS',
            startDate: new Date()
        });
        return await newService.save();
    } catch (err) {
        throw new Error('Error interno al generar el servicio: ' + err.message);
    }
};

// CLIENT: Ver Estado del Servicio (Ver Servicio)
export const getServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);
        
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });
        
        return res.send({ success: true, service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al consultar el servicio', err: err.message });
    }
};

// WORKER: Editar Servicio para marcar trabajo como terminado
export const finishService = async (req, res) => {
    try {
        const { id } = req.params;
        
        const service = await Service.findByIdAndUpdate(id, { 
            status: 'COMPLETED', 
            endDate: new Date() 
        }, { new: true });
        
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });
        
        return res.send({ success: true, message: 'Trabajo marcado como terminado exitosamente', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al finalizar el servicio', err: err.message });
    }
};

// CUALQUIERA: cancelar el servicio
export const cancelService = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason, role } = req.body;
        
        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        // El servicio ya finalizo o fue cancelado?
        if (service.status === 'CANCELLED') {
            return res.status(400).send({ 
                success: false, 
                message: `Este servicio ya fue cancelado previamente por: ${service.cancelledBy}` 
            });
        }

        if (service.status === 'COMPLETED') {
            return res.status(400).send({ 
                success: false, 
                message: 'No se puede cancelar un servicio que ya ha sido marcado como completado.' 
            });
        }

        // Terminamos de cancelar el servicio
        service.status = 'CANCELLED';
        service.cancelReason = cancelReason;
        service.cancelledBy = role;
        service.endDate = new Date();

        await service.save();

        return res.send({ success: true, message: 'Servicio cancelado exitosamente', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al cancelar', err: err.message });
    }
};