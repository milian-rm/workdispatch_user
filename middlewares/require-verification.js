import User from '../src/Users/user.model.js';

export const requireVerification = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.uid;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        const user = await User.findById(userId).select('verificationStatus');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (!user.verificationStatus) {
            return res.status(403).json({
                success: false,
                message: 'Tu identidad no ha sido verificada. Por favor verifica tu cuenta para realizar esta acción.',
                requiresVerification: true
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al verificar la identidad del usuario' });
    }
};
