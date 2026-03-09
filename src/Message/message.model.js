import { Schema, model } from 'mongoose';

const messageSchema = Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: [true, 'La conversación es obligatoria']
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El remitente es obligatorio']
    },
    content: {
        type: String,
        required: [true, 'El contenido del mensaje es obligatorio']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default model('Message', messageSchema);