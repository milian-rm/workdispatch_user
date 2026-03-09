import Message from './message.model.js';
import Conversation from '../Conversation/conversation.model.js';

export const sendMessage = async (req, res) => {
    try {

        const { conversationId, senderId, content } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        const message = new Message({
            conversationId,
            senderId,
            content
        });

        await message.save();

        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado correctamente',
            data: message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje',
            error: error.message
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