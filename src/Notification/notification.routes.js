import { Router } from 'express';
import { getUserNotifications, markAllAsRead, markAsRead } from './notification.controller.js';
import { getNotificationsValidator,  } from '../../middlewares/notification-validator.js';

const router = Router();

// Ruta para que Cliente o Trabajador vean sus notificaciones
router.get(
    '/:userId', 
    getNotificationsValidator, 
    getUserNotifications
);
router.patch('/:id/read', markAsRead);
router.patch('/:userId/read-all', markAllAsRead);

export default router;