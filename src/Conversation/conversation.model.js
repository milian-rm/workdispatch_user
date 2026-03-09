import { Schema, model } from 'mongoose';

const conversationSchema = Schema({
    user1Id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario 1 es obligatorio']
    },
    user2Id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario 2 es obligatorio']
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: null
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

export default model('Conversation', conversationSchema);