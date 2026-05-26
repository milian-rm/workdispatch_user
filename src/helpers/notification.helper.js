import Notification from '../Notification/notification.model.js';
import User from '../Users/user.model.js';

// Notificación para un usuario específico
export const createAutomaticNotification = async (userId, message, type) => {
    try {
        const newNotification = new Notification({ userId, Message: message, Type: type });
        await newNotification.save();
    } catch (error) {
        console.error('Error al lanzar la notificación automática:', error.message);
    }
};

// Notificación para todos los admins del sistema
export const createAdminNotification = async (message, type) => {
    try {
        const admins = await User.find({ role: 'ADMIN' }, '_id');
        console.log(`[AdminNotif] Admins encontrados: ${admins.length}`);

        if (!admins.length) {
            console.warn('[AdminNotif] No se encontró ningún usuario con rol ADMIN');
            return;
        }

        const notifications = admins.map((admin) => ({
            userId:  admin._id,
            Message: message,
            Type:    type
        }));

        await Notification.insertMany(notifications);
        console.log(`[AdminNotif] Notificación "${type}" creada para ${admins.length} admin(s)`);
    } catch (error) {
        console.error('Error al lanzar notificación al admin:', error.message);
    }
};