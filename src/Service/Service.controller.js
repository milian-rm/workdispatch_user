'use strict';

import Service from './Service.model.js';

/**
 * MÉTODO AUTOMÁTICO: Crear un servicio (Llamado desde proposal.controller.js)
 * No es un endpoint (no recibe req, res), es una función de servicio interno.
 */
export const createServiceFromProposal = async (serviceData) => {
    try {
        const newService = new Service({
            requestId: serviceData.requestId,
            clientId: serviceData.clientId,
            workerId: serviceData.workerId,
            finalPrice: serviceData.price,
            status: 'IN_PROGRESS', // El servicio inicia al aceptarse la propuesta
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