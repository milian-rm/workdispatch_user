'use strict';

import WorkerPortfolio from './WorkerPortFolio.model.js';

// WORKER: Agregar registros a su portafolio
export const addRecord = async (req, res) => {
    try {
        const data = req.body; 

        // Verrificar si cloudinary subio la imagen
        if (!req.file) {
            return res.status(400).send({ 
                success: false, 
                message: 'La imagen del trabajo es obligatoria' 
            });
        }

        
        const record = new WorkerPortfolio({
            ...data,
            imageUrl: req.file.path // Aquí llega la URL de Cloudinary
        });

        await record.save();
        
        return res.status(201).send({ 
            success: true, 
            message: 'Registro añadido al portafolio con imagen exitosamente', 
            record 
        });
    } catch (err) {
        return res.status(500).send({ 
            success: false, 
            message: 'Error al añadir registro', 
            err: err.message 
        });
    }
};

// WORKER: Ver su propio portafolio (usamos ID por parámetro)
export const getMyPortfolio = async (req, res) => {
    try {
        const { workerId } = req.params;
        const portfolio = await WorkerPortfolio.find({ 
            workerId, 
            status: 'ACTIVE' 
        });

        return res.send({ success: true, portfolio });
    } catch (err) {
        return res.status(500).send({ 
            success: false, 
            message: 'Error al obtener el portafolio' 
        });
    }
};

// CLIENT: Ver registros de un ID específico
export const getPortfolioByWorker = async (req, res) => {
    try {
        const { id } = req.params; 
        const portfolio = await WorkerPortfolio.find({ 
            workerId: id, 
            status: 'ACTIVE' 
        });

        return res.send({ success: true, portfolio });
    } catch (err) {
        return res.status(500).send({ 
            success: false, 
            message: 'Error al obtener el portafolio del trabajador' 
        });
    }
};

// WORKER: Editar registros de su portafolio
export const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updated = await WorkerPortfolio.findByIdAndUpdate(id, data, { new: true });

        if (!updated) return res.status(404).send({ success: false, message: 'Registro no encontrado' });

        return res.send({ success: true, message: 'Registro actualizado', updated });
    } catch (err) {
        return res.status(500).send({ 
            success: false, 
            message: 'Error al actualizar el registro', 
            err: err.message 
        });
    }
};

// WORKER: Cambiar estado del registro (Activar/Desactivar)
export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await WorkerPortfolio.findById(id);

        if (!record) return res.status(404).send({ success: false, message: 'Registro no encontrado' });

        record.status = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        record.deletedAt = record.status === 'INACTIVE' ? new Date() : null;

        await record.save();

        return res.send({ 
            success: true, 
            message: `Registro marcado como ${record.status}`, 
            record 
        });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al cambiar el estado' });
    }
};