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