import Message from './message.model.js';
import Conversation from '../Conversation/conversation.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

export const sendMessage = async (req, res) => {
    try {

        const { conversationId, content, senderId } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).send({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        // Validar que el sender pertenece a la conversación
        if (
            senderId !== conversation.user1Id.toString() &&
            senderId !== conversation.user2Id.toString()
        ) {
            return res.status(403).send({
                success: false,
                message: 'El usuario no pertenece a esta conversación'
            });
        }

        // Crear mensaje
        const newMessage = new Message({
            conversationId,
            senderId,
            content
        });

        await newMessage.save();

        // Determinar receptor
        const receiverId =
            senderId === conversation.user1Id.toString()
                ? conversation.user2Id
                : conversation.user1Id;

        // Actualizar último mensaje de la conversación
        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();

        await conversation.save();

        // Crear notificación automática
        await createAutomaticNotification(
            receiverId,
            'Tienes un nuevo mensaje.',
            'NEW_MESSAGE'
        );

        return res.send({
            success: true,
            message: 'Mensaje enviado',
            newMessage
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'Error al enviar mensaje',
            err: err.message
        });
    }
};


export const getMessagesByConversation = async (req, res) => {
    try {

        const { conversationId } = req.params;

        const messages = await Message.find({
            conversationId,
            deletedAt: null
        }).populate('senderId', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes',
            error: error.message
        });
    }
};