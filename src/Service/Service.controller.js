'use strict';

import mongoose from 'mongoose';
import Service from './Service.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

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

export const getServicesByWorker = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.send({ success: true, services: [] });
        }

        const services = await Service.find({ workerId })
            .populate({
                path: 'requestId',
                select: 'title description serviceImage address categoryId budgetMin budgetMax status createdAt',
                populate: {
                    path: 'categoryId',
                    select: 'name'
                }
            })
            .populate('clientId', 'firstName lastName email profilePhoto')
            .sort({ createdAt: -1 });

        return res.send({ success: true, services });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al obtener servicios del trabajador', err: err.message });
    }
};

// CLIENT: Ver servicios donde es cliente
export const getServicesByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.send({ success: true, services: [] });
        }

        const services = await Service.find({ clientId })
            .populate({
                path: 'requestId',
                select: 'title description serviceImage address categoryId budgetMin budgetMax status createdAt',
                populate: {
                    path: 'categoryId',
                    select: 'name'
                }
            })
            .populate('workerId', 'firstName lastName email profilePhoto ratingAverage')
            .sort({ createdAt: -1 });

        return res.send({ success: true, services });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al obtener servicios del cliente', err: err.message });
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
        
        await createAutomaticNotification(
            service.clientId,
            'Tu servicio ha sido marcado como terminado por el trabajador.',
            'SERVICE_COMPLETED'
        );


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

        const notifyUserId = role === 'CLIENT' ? service.workerId : service.clientId;
        
        await createAutomaticNotification(
            notifyUserId,
            `El servicio ha sido cancelado por el ${role}. Razón: ${cancelReason}`,
            'SERVICE_CANCELLED'
        );

        return res.send({ success: true, message: 'Servicio cancelado exitosamente', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al cancelar', err: err.message });
    }
};

export const scheduleService = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledDate, estimatedDurationDays, workPlan } = req.body;

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para programar este servicio' });
        }

        if (!scheduledDate || !estimatedDurationDays || !Array.isArray(workPlan)) {
            return res.status(400).send({ success: false, message: 'Faltan campos obligatorios: scheduledDate, estimatedDurationDays, workPlan' });
        }

        if (workPlan.length !== estimatedDurationDays) {
            return res.status(400).send({ success: false, message: `El plan debe tener exactamente ${estimatedDurationDays} días` });
        }

        const sorted = [...workPlan].sort((a, b) => a.dayNumber - b.dayNumber);
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].dayNumber !== i + 1) {
                return res.status(400).send({ success: false, message: `Los dayNumber deben ser secutivos desde 1 hasta ${estimatedDurationDays}` });
            }
            if (!sorted[i].description || sorted[i].description.trim().length === 0) {
                return res.status(400).send({ success: false, message: `El día ${i + 1} necesita una descripción` });
            }
        }

        const baseDate = new Date(scheduledDate);
        const planWithDates = sorted.map((item) => ({
            dayNumber: item.dayNumber,
            date: new Date(baseDate.getTime() + (item.dayNumber - 1) * 24 * 60 * 60 * 1000),
            description: item.description.trim(),
            status: 'PENDING'
        }));

        const isFirstSchedule = !service.scheduledDate;
        service.scheduledDate = baseDate;
        service.estimatedDurationDays = estimatedDurationDays;
        service.workPlan = planWithDates;
        await service.save();

        if (isFirstSchedule) {
            const dateStr = baseDate.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
            await createAutomaticNotification(
                service.clientId,
                `El trabajador programó una cita para el ${dateStr} y definió un plan de trabajo de ${estimatedDurationDays} día(s).`,
                'WORK_PLAN_CREATED'
            );
        }

        return res.send({ success: true, message: 'Plan de trabajo guardado', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al programar el servicio', err: err.message });
    }
};

export const toggleWorkPlanDay = async (req, res) => {
    try {
        const { id, dayNumber } = req.params;
        const dayNum = parseInt(dayNumber, 10);

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para modificar este servicio' });
        }

        if (service.status === 'CANCELLED') {
            return res.status(400).send({ success: false, message: 'No se puede modificar el plan de un servicio cancelado' });
        }

        const day = service.workPlan.find((d) => d.dayNumber === dayNum);
        if (!day) {
            return res.status(404).send({ success: false, message: `No existe el día ${dayNum} en el plan` });
        }

        day.status = day.status === 'DONE' ? 'PENDING' : 'DONE';
        await service.save();

        return res.send({ success: true, message: `Día ${dayNum} marcado como ${day.status}`, service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al actualizar el día del plan', err: err.message });
    }
};
