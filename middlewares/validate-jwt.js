import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No se proporciono un token' });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = { _id: decoded.uid, uid: decoded.uid, role: decoded.role, email: decoded.email }; next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalido o expirado' });
    }
};
