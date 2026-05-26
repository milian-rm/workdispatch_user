import Report from './report.model.js';
import { createAutomaticNotification, createAdminNotification } from '../helpers/notification.helper.js';

export const createReport = async (req, res) => {
    try {
        const data = req.body;
        const report = new Report(data);
        await report.save();

        // Notificar al usuario reportado
        await createAutomaticNotification(
            data.reporteredId,
            'Atención: Se ha recibido un reporte por incumplimiento o mala conducta.',
            'ACCOUNT_REPORTED'
        );

        // Notificar al admin
        await createAdminNotification(
            'Se ha recibido un nuevo reporte en el sistema. Revísalo en el panel de administración.',
            'NEW_REPORT'
        );

        res.status(201).json({ success: true, message: 'Reporte creado exitosamente', report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear el reporte', error: error.message });
    }
};

export const getCreatedReports = async (req, res) => {
    try {
        const { userId } = req.params;
        const reports = await Report.find({ reporterId: userId }).populate('reporteredId', 'firstName lastName');
        res.status(200).json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los reportes creados', error: error.message });
    }
};

export const getReceivedReports = async (req, res) => {
    try {
        const { userId } = req.params;
        const reports = await Report.find({ reporteredId: userId }).populate('reporterId', 'firstName lastName');
        res.status(200).json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los reportes recibidos', error: error.message });
    }
};