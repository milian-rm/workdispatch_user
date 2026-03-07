'use strict';

import User from './user.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

export const register = async (req, res) => {
    try {
        const data = req.body;

        if (req.file){
            const extension = req.file.path.split('.').pop();
            const filename = req.file.filename;
            const relativePath = filename.substring(filename.indexOf('users/'));

            data.profilePhoto = `${relativePath}.${extension}`;
        } else {
            data.profilePhoto = `users/default-profile.png`;
        }

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        const user = new User(data);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Correo o contraseña incorrectos'
            });
        }

        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el perfil',
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (req.file){
            const currentUser = await User.findById(id);

            if (currentUser && currentUser.profilePhoto) {
                const photoPath = currentUser.profilePhoto;
                const photoWithoutExt = photoPath.substring(0, photoPath.lastIndexOf('.'));
            };
            const publicId = `workDispatch/${photoWithoutExt}`;

            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error('Error al eliminar imagen anterior:', deleteError);
            }
        }

        const userExist = await User.findById(id);
        if (!userExist) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const userUpdated = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: userUpdated
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil',
            error: error.message
        });
    }
};