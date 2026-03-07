import Verification from './verification.model.js';
import User from '../Users/user.model.js';

export const createVerification = async (req, res) => {
    try {
        const data = req.body;

        if (req.files?.documentImageFront?.[0]) {
            data.documentImageFront = req.files.documentImageFront[0].path;
        } else {
            data.documentImageFront = null;
        }

        if (req.files?.documentImageBack?.[0]) {
            data.documentImageBack = req.files.documentImageBack[0].path;
        } else {
            data.documentImageBack = null;
        }

        const existingVerification = await Verification.findOne({ userId: data.userId });

        if (existingVerification) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya tiene una solicitud de verificación'
            });
        }

        const verification = new Verification(data);
        await verification.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud de verificación creada correctamente',
            data: verification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la solicitud de verificación',
            error: error.message
        });
    }
};

export const getVerificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const verification = await Verification.findById(id)
            .populate('userId', 'firstName lastName email')
            .populate('reviewedBy', 'firstName lastName email');

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud de verificación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: verification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la verificación',
            error: error.message
        });
    }
};