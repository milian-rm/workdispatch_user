import Conversation from './conversation.model.js';

export const createConversation = async (req, res) => {
    try {

        const { user1Id, user2Id } = req.body;

        if (user1Id === user2Id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes crear una conversación contigo mismo'
            });
        }

        const existingConversation = await Conversation.findOne({
            $or: [
                { user1Id, user2Id },
                { user1Id: user2Id, user2Id: user1Id }
            ],
            deletedAt: null
        });

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                message: 'La conversación ya existe',
                data: existingConversation
            });
        }

        const conversation = new Conversation({
            user1Id,
            user2Id
        });

        await conversation.save();

        res.status(201).json({
            success: true,
            message: 'Conversación creada correctamente',
            data: conversation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear conversación',
            error: error.message
        });
    }
};

export const getUserConversations = async (req, res) => {
    try {

        const { userId } = req.params;

        const conversations = await Conversation.find({
            $or: [
                { user1Id: userId },
                { user2Id: userId }
            ],
            deletedAt: null
        }).populate('user1Id user2Id', 'firstName lastName email');

        res.status(200).json({
            success: true,
            data: conversations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener conversaciones',
            error: error.message
        });
    }
};