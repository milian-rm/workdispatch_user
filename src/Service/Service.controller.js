'use strict';

import mongoose from 'mongoose';
import Service from './Service.model.js';
import User from '../Users/user.model.js';
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
        const service = await Service.findById(id)
            .populate({
                path: 'requestId',
                select: 'title description serviceImage address categoryId budgetMin budgetMax status createdAt latitude longitude',
                populate: { path: 'categoryId', select: 'name' }
            })
            .populate('clientId', 'firstName lastName email phone profilePhoto')
            .populate('workerId', 'firstName lastName email phone profilePhoto')

        
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

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        // No se puede completar sin un plan de trabajo definido
        if (!Array.isArray(service.workPlan) || service.workPlan.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No puedes marcar el servicio como completado sin un plan de trabajo definido.'
            });
        }

        if (!service.estimatedEndDate) {
            return res.status(400).send({
                success: false,
                message: 'El plan de trabajo no tiene una fecha de fin estimada.'
            });
        }

        // No se puede completar antes de que llegue la fecha de fin del plan
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const planEndDate = new Date(service.estimatedEndDate);
        planEndDate.setHours(0, 0, 0, 0);

        if (today < planEndDate) {
            return res.status(400).send({
                success: false,
                message: `No puedes marcar el servicio como completado antes de la fecha de fin del plan (${planEndDate.toLocaleDateString('es-GT')}).`
            });
        }

        service.status = 'COMPLETED';
        service.endDate = new Date();
        await service.save();

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

// ================= WORK PLAN HELPERS =================

const MAX_DISPUTE_PENALTY = 0.50;
const BASE_PENALTY = 0.01;

function getDisputePenalty(disputeCount) {
    const total = BASE_PENALTY * (Math.pow(2, disputeCount) - 1);
    return Math.min(total, MAX_DISPUTE_PENALTY);
}

// WORKER: Configurar plan de trabajo (fechas estimadas + plan general)
export const setupPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { estimatedStartDate, estimatedEndDate, generalPlan } = req.body;

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para modificar este servicio' });
        }

        if (service.status === 'CANCELLED' || service.status === 'COMPLETED') {
            return res.status(400).send({ success: false, message: 'No se puede modificar un servicio cancelado o completado' });
        }

        if (estimatedStartDate) service.estimatedStartDate = new Date(estimatedStartDate);
        if (estimatedEndDate) service.estimatedEndDate = new Date(estimatedEndDate);
        if (generalPlan !== undefined) service.generalPlan = generalPlan.trim();

        // Si se cambian las fechas, reiniciar el workPlan
        if (estimatedStartDate && estimatedEndDate) {
            service.workPlan = [];
        }

        await service.save();

        await createAutomaticNotification(
            service.clientId,
            'El trabajador ha definido el plan de trabajo con fechas estimadas.',
            'WORK_PLAN_SETUP'
        );

        return res.send({ success: true, message: 'Plan de trabajo guardado', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al guardar el plan de trabajo', err: err.message });
    }
};

// WORKER: Agregar entrada diaria al workPlan
export const addWorkLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, description } = req.body;

        if (!date || !description || description.trim().length === 0) {
            return res.status(400).send({ success: false, message: 'Fecha y descripción son obligatorias' });
        }

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para modificar este servicio' });
        }

        if (service.status === 'CANCELLED' || service.status === 'COMPLETED') {
            return res.status(400).send({ success: false, message: 'No se puede modificar un servicio cancelado o completado' });
        }

        if (!service.estimatedStartDate) {
            return res.status(400).send({ success: false, message: 'Primero debes configurar el plan de trabajo (fechas estimadas)' });
        }

        const lastDay = service.workPlan.length > 0
            ? Math.max(...service.workPlan.map(d => d.dayNumber))
            : 0;

        const newDay = {
            dayNumber: lastDay + 1,
            date: new Date(date),
            description: description.trim(),
            status: 'PENDING'
        };

        service.workPlan.push(newDay);
        await service.save();

        await createAutomaticNotification(
            service.clientId,
            `El trabajador agregó una entrada al plan de trabajo: "${description.trim().substring(0, 80)}"`,
            'NEW_WORK_LOG'
        );

        return res.send({ success: true, message: 'Entrada diaria agregada', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al agregar entrada diaria', err: err.message });
    }
};

// WORKER: Editar descripción de un día PENDING
export const editWorkLog = async (req, res) => {
    try {
        const { id, dayNumber } = req.params;
        const { description } = req.body;
        const dayNum = parseInt(dayNumber, 10);

        if (!description || description.trim().length === 0) {
            return res.status(400).send({ success: false, message: 'La descripción es obligatoria' });
        }

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para modificar este servicio' });
        }

        const day = service.workPlan.find(d => d.dayNumber === dayNum);
        if (!day) {
            return res.status(404).send({ success: false, message: `No existe el día ${dayNum} en el plan` });
        }

        if (day.status !== 'PENDING') {
            return res.status(400).send({ success: false, message: 'Solo se pueden editar días pendientes' });
        }

        day.description = description.trim();
        await service.save();

        return res.send({ success: true, message: 'Entrada actualizada', service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al editar entrada diaria', err: err.message });
    }
};

// WORKER: Marcar día como completado
export const completeWorkDay = async (req, res) => {
    try {
        const { id, dayNumber } = req.params;
        const dayNum = parseInt(dayNumber, 10);

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para modificar este servicio' });
        }

        const day = service.workPlan.find(d => d.dayNumber === dayNum);
        if (!day) {
            return res.status(404).send({ success: false, message: `No existe el día ${dayNum} en el plan` });
        }

        if (day.status !== 'PENDING') {
            return res.status(400).send({ success: false, message: `El día ya está en estado ${day.status}` });
        }

        day.status = 'DONE';
        await service.save();

        await createAutomaticNotification(
            service.clientId,
            `El trabajador marcó el día ${dayNum} del plan como completado.`,
            'WORKER_MARKED_DAY_DONE',
            service._id
        );

        return res.send({ success: true, message: `Día ${dayNum} marcado como completado`, service });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al completar el día', err: err.message });
    }
};

// CLIENTE: Verificar o disputar un día completado
export const verifyWorkDay = async (req, res) => {
    try {
        const { id, dayNumber } = req.params;
        const { verified, clientNote } = req.body;
        const dayNum = parseInt(dayNumber, 10);

        if (typeof verified !== 'boolean') {
            return res.status(400).send({ success: false, message: 'El campo verified es obligatorio (true/false)' });
        }

        const service = await Service.findById(id);
        if (!service) return res.status(404).send({ success: false, message: 'Servicio no encontrado' });

        if (service.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'No tienes permiso para verificar este servicio' });
        }

        const day = service.workPlan.find(d => d.dayNumber === dayNum);
        if (!day) {
            return res.status(404).send({ success: false, message: `No existe el día ${dayNum} en el plan` });
        }

        if (day.status !== 'DONE') {
            return res.status(400).send({ success: false, message: 'Solo se pueden verificar días marcados como completados por el trabajador' });
        }

        if (verified) {
            day.status = 'VERIFIED';
            day.verifiedAt = new Date();
            if (clientNote !== undefined) day.clientNote = clientNote?.trim() || null;
            await service.save();

            await createAutomaticNotification(
                service.workerId,
                `El cliente verificó el día ${dayNum} del plan de trabajo.`,
                'DAY_VERIFIED',
                service._id
            );

            return res.send({ success: true, message: 'Día verificado correctamente', service });
        } else {
            day.status = 'DISPUTED';
            day.disputedAt = new Date();
            day.clientNote = clientNote?.trim() || null;
            await service.save();

            // Reputación: actualizar disputeCount y ratingAverage del worker
            const worker = await User.findById(service.workerId);
            if (worker) {
                worker.disputeCount = (worker.disputeCount || 0) + 1;
                const penalty = getDisputePenalty(worker.disputeCount);
                worker.ratingAverage = Math.max(1, (worker.ratingAverage || 1) - penalty);
                worker.ratingAverage = Math.round(worker.ratingAverage * 100) / 100;
                await worker.save();
            }

            await createAutomaticNotification(
                service.workerId,
                `El cliente disputó el día ${dayNum} del plan de trabajo. Tu calificación se ha visto afectada.`,
                'DAY_DISPUTED',
                service._id
            );

            return res.send({ success: true, message: 'Día disputado. La reputación del trabajador ha sido ajustada.', service });
        }
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al verificar el día', err: err.message });
    }
};
