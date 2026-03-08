import { Schema, model } from 'mongoose';

const verificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
    },
    documentType: {
        type: String,
        required: [true, 'El tipo de documento es obligatorio'],
        trim: true
    },
    documentNumber: {
        type: String,
        required: [true, 'El número de documento es obligatorio'],
        trim: true
    },
    documentImageFront: {
        type: String,
        default: null
    },
    documentImageBack: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

export default model('Verification', verificationSchema);