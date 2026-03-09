import Notification from '../Notification/notification.model.js';

// Función reutilizable para crear notificaciones automáticas
// Recibe el ID de a quién le llega, el texto del mensaje y la categoría
export const createAutomaticNotification = async (userId, message, type) => {
    try {
        const newNotification = new Notification({
            userId,
            Message: message,
            Type: type
        });
        await newNotification.save();
    } catch (error) {
        console.error('Error al lanzar la notificación automática:', error.message);
        // Solo lo mostramos en consola para que, si falla la noti, 
        // no se caiga todo el proceso principal (ej. que sí se envíe el msj pero falle la noti)
    }
};