'use strict';

import Proposal from './Proposal.model.js';
import Service from '../Service/Service.model.js';
import ServiceRequest from '../ServiceRequest/serviceRequest.model.js';
import { createServiceFromProposal } from '../Service/Service.controller.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

// WORKER: Crear Propuesta
export const createProposal = async (req, res) => {
    try {
        const { serviceRequestId, workerId } = req.body;

        // Validamos si la solicitud ya tiene una propuesta acepotada
        const acceptedProposal = await Proposal.findOne({
            serviceRequestId,
            status: 'ACCEPTED'
        });

        if (acceptedProposal) {
            return res.status(400).send({
                success: false,
                message: 'Esta solicitud ya ha aceptado una propuesta y no recibe más ofertas.'
            });
        }

        // Validamos si existe una propuesta de este trabajador para este request
        const alreadyProposed = await Proposal.findOne({ serviceRequestId, workerId });

        if (alreadyProposed) {
            return res.status(400).send({
                success: false,
                message: 'Ya has enviado una propuesta para esta solicitud. Solo se permite una por trabajador.'
            });
        }

        const proposal = new Proposal(req.body);
        await proposal.save();

        const request = await ServiceRequest.findById(serviceRequestId);
        if (request) {
            await createAutomaticNotification(
                request.clientId,
                '¡Tienes una nueva propuesta para tu solicitud de servicio!',
                'NEW_PROPOSAL'
            );
        }

        return res.status(201).send({ success: true, message: 'Propuesta enviada', proposal });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al enviar propuesta', err: err.message });
    }
};

// WORKER: Editar Propuesta
export const updateProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await Proposal.findOneAndUpdate({ _id: id, status: 'PENDING' }, data, { new: true });
        if (!updated) return res.status(404).send({ success: false, message: 'Propuesta no encontrada o ya no se puede editar' });
        return res.send({ success: true, message: 'Propuesta actualizada', updated });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al actualizar', err: err.message });
    }
};

// WORKER: Cancelar Propuesta
export const cancelProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal.findByIdAndUpdate(id, { status: 'CANCELLED' }, { new: true });
        return res.send({ success: true, message: 'Propuesta cancelada', proposal });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al cancelar' });
    }
};

// CLIENT: Ver Propuestas para su solicitud
export const getProposalsByServiceRequest = async (req, res) => {
    try {
        const { serviceRequestId } = req.params;
        const proposals = await Proposal.find({ serviceRequestId });
        return res.send({ success: true, proposals });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al obtener propuestas' });
    }
};

// CLIENT: Aceptar Propuesta 
export const acceptProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId } = req.body;

        if (!clientId) {
            return res.status(400).send({ success: false, message: 'El ID del cliente es obligatorio en el body' });
        }

        // Buscamos y actualizamos la propuesta
        const proposal = await Proposal.findByIdAndUpdate(id, { status: 'ACCEPTED' }, { new: true });
        // Rechaza automaticamente todas las demas propuestas de la misma solicitud sin afectar a la aceptada
        await Proposal.updateMany(
            {
                serviceRequestId: proposal.serviceRequestId,
                _id: { $ne: id }
            },
            { status: 'REJECTED' }
        );

        if (!proposal) return res.status(404).send({ success: false, message: 'Propuesta no encontrada' });

        const newService = await createServiceFromProposal({
            requestId: proposal.serviceRequestId,
            clientId: clientId,
            workerId: proposal.workerId,
            price: proposal.price
        });

        await createAutomaticNotification(
            proposal.workerId,
            '¡Buenas noticias! Tu propuesta ha sido aceptada y el servicio ha sido creado.',
            'PROPOSAL_ACCEPTED'
        );

        return res.send({
            success: true,
            message: 'Propuesta aceptada y servicio creado.',
            proposal,
            serviceId: newService._id
        });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al aceptar propuesta', err: err.message });
    }
};

// CLIENT: Rechazar Propuesta
export const rejectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        await Proposal.findByIdAndUpdate(id, { status: 'REJECTED' });
        return res.send({ success: true, message: 'Propuesta rechazada' });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al rechazar' });
    }
};