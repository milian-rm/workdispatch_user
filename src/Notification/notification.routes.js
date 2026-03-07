import { Router } from 'express';
import { getUserNotifications } from './notification.controller.js';
import { getNotificationsValidator } from '../../middlewares/notification-validator.js';

const router = Router();

// Ruta para que Cliente o Trabajador vean sus notificaciones
router.get(
    '/:userId', 
    getNotificationsValidator, 
    getUserNotifications
);

export default router;