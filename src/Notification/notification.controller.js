import Notification from './notification.model.js';

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las notificaciones',
            error: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al marcar como leída', error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al marcar todas como leídas', error: error.message });
    }
};