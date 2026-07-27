'use strict';

import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from './user.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

const AUTH_SERVICE_URL = process.env.AUTH_URL;
const JWT_SECRET = process.env.SECRET_KEY;

const createAuthUser = async (payload) => {
    const paths = [
        `${AUTH_SERVICE_URL}/Auth/register`,
        `${AUTH_SERVICE_URL}/auth/register`,
        `${AUTH_SERVICE_URL}/register`,
    ];

    const body = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone || '',
        role: payload.role || 'CLIENT',
        description: payload.description || '',
        address: payload.address || '',
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
    };

    let lastError;
    for (const url of paths) {
        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            });

            const authId = response.data?.user?.id || response.data?.data?.id || response.data?.id;
            if (!authId) throw new Error('AuthService no devolvio un ID de usuario');

            return { id: authId };
        } catch (error) {
            lastError = error;
            if (error.response?.status !== 404) throw error;
        }
    }

    throw lastError;
};

const loginAuthUser = async (payload) => {
    const paths = [
        `${AUTH_SERVICE_URL}/Auth/login`,
        `${AUTH_SERVICE_URL}/auth/login`,
        `${AUTH_SERVICE_URL}/login`,
    ];

    const body = {
        email: payload.email,
        password: payload.password,
    };

    let lastError;
    for (const url of paths) {
        try {
            const response = await axios.post(url, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            });

            return response.data;
        } catch (error) {
            lastError = error;
            if (error.response?.status !== 404) throw error;
        }
    }

    throw lastError;
};

const getAuthUserId = (authData) =>
    authData?.userDetails?.id
    || authData?.UserDetails?.Id
    || authData?.user?.id
    || authData?.data?.id
    || authData?.id;

const getAuthUserEmail = (authData, fallbackEmail) =>
    authData?.userDetails?.email
    || authData?.UserDetails?.Email
    || authData?.user?.email
    || authData?.data?.email
    || fallbackEmail;

const createAccessToken = (user) =>
    jwt.sign(
        { uid: user._id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

const sanitizeUser = (user) => {
    if (!user) return null;
    const safe = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safe.password;
    return safe;
};

export const register = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.profilePhoto = req.file.path;
        } else {
            data.profilePhoto = 'users/default-profile.png';
        }

        data.email = data.email?.toLowerCase();

        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya esta registrado'
            });
        }

        const authPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: data.role,
            description: data.description,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
        };

        let authUser;
        try {
            authUser = await createAuthUser(authPayload);
        } catch (authError) {
            const authMsg = authError.response?.data?.message
                || authError.response?.data?.errors?.[0]?.description
                || authError.message
                || 'Error al registrar en AuthService';

            console.error('AuthService error:', authError.response?.data || authError.message);
            return res.status(500).json({ success: false, message: `AuthService: ${authMsg}` });
        }

        if (!authUser?.id) {
            return res.status(500).json({
                success: false,
                message: 'AuthService no devolvio un ID valido'
            });
        }

        const mongoUserData = { ...data };
        delete mongoUserData.password;

        const user = new User({
            ...mongoUserData,
            authUserId: authUser.id,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: sanitizeUser(user)
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
        const normalizedEmail = email.toLowerCase();

        let authData;
        try {
            authData = await loginAuthUser({ email: normalizedEmail, password });
        } catch (authError) {
            const status = authError.response?.status;
            const authMsg = authError.response?.data?.message
                || authError.response?.data?.title
                || authError.message
                || 'Error al iniciar sesion en AuthService';

            console.error('AuthService login error:', authError.response?.data || authError.message);

            return res.status(status === 401 || status === 403 ? status : 500).json({
                success: false,
                message: status === 401 ? 'Correo o contrasena incorrectos' : `AuthService: ${authMsg}`
            });
        }

        const authUserId = getAuthUserId(authData);
        const authEmail = getAuthUserEmail(authData, normalizedEmail)?.toLowerCase();
        const searchFilters = [{ email: authEmail }];

        if (authUserId) {
            searchFilters.unshift({ authUserId });
        }

        const user = await User.findOne({ $or: searchFilters });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado en Mongo'
            });
        }

        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        if (authUserId && user.authUserId !== authUserId) {
            user.authUserId = authUserId;
            await user.save();
        }

        const accessToken = createAccessToken(user);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesion exitoso',
            accessToken,
            expiresIn: 3600,
            userDetails: sanitizeUser(user)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

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
        const updates = { ...req.body };
        delete updates.password;

        if (req.file) {
            const currentUser = await User.findById(id);

            if (currentUser && currentUser.profilePhoto) {
                try {
                    const photoPath = currentUser.profilePhoto;

                    const urlParts = photoPath.split('/');
                    const fileWithExtension = urlParts[urlParts.length - 1];
                    const folder = urlParts[urlParts.length - 2];

                    const fileName = fileWithExtension.substring(0, fileWithExtension.lastIndexOf('.'));
                    const publicId = `${folder}/${fileName}`;

                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error('Error al eliminar imagen anterior:', deleteError);
                }
            }

            updates.profilePhoto = req.file.path;
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
        ).select('-password');

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
