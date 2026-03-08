import Report from './report.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

export const createReport = async (req, res) => {
    try {
        const data = req.body;
        const report = new Report(data);
        await report.save();

        await createAutomaticNotification(
            data.reporteredId, // Al que están reportando
            'Atención: Tu cuenta ha recibido un reporte por incumplimiento o mala conducta.', 
            'ACCOUNT_REPORTED'
        );

        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el reporte',
            error: error.message
        });
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