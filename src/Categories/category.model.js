import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, { versionKey: false, timestamps: true });

export default model('Category', categorySchema);