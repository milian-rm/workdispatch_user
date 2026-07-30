'use strict';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { corsOptions } from './cors-configuration.js';

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: corsOptions,
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('No se proporcionó un token'));
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            socket.userId = decoded.uid;
            next();
        } catch (error) {
            next(new Error('Token inválido o expirado'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(socket.userId);
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado todavía');
    }
    return io;
};

export { initSocket, getIO };