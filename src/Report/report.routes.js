import { Router } from 'express';
import { createReport, getCreatedReports, getReceivedReports } from './report.controller.js';
import { createReportValidator, getReportsValidator } from '../../middlewares/report-validator.js';

const router = Router();

router.post(
    '/', 
    createReportValidator, 
    createReport
);
// Rutas separadas para mayor claridad en el frontend
router.get(
    '/created/:userId', 
    getReportsValidator, 
    getCreatedReports
);
router.get(
    '/received/:userId', 
    getReportsValidator, 
    getReceivedReports
);

export default router;