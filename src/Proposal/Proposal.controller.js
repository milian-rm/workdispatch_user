'use strict';

import Proposal from './Proposal.model.js';
// Importaremos el modelo Service más adelante para la creación automática
// import Service from '../service/service.model.js'; 

// WORKER: Crear Propuesta
export const createProposal = async (req, res) => {
    try {
        const data = req.body;
        const proposal = new Proposal(data);
        await proposal.save();
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

// CLIENT: Aceptar Propuesta (¡Aquí va la lógica de creación de Servicio!)
export const acceptProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal.findByIdAndUpdate(id, { status: 'ACCEPTED' }, { new: true });
        
        if (!proposal) return res.status(404).send({ success: false, message: 'Propuesta no encontrada' });

        // AQUÍ ES DONDE LLAMAREMOS AL MÉTODO PARA CREAR EL SERVICIO AUTOMÁTICO
        // await createServiceFromProposal(proposal); 
        
        return res.send({ success: true, message: 'Propuesta aceptada. Servicio creado.', proposal });
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