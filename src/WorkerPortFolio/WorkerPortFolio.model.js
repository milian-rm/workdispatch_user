'use strict';

import { Schema, model } from 'mongoose';

const workerPortfolioSchema = Schema({
    workerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del trabajador es obligatorio']
    },
    imageUrl: {
        type: String,
        required: [true, 'La imagen del trabajo es obligatoria']
    },
    description: {
        type: String,
        required: [true, 'La descripción del trabajo es obligatoria'],
        maxLength: [500, 'La descripción no puede exceder los 500 caracteres']
    },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'INACTIVE'], 
        default: 'ACTIVE' 
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { 
    versionKey: false, 
    timestamps: true 
});

export default model('WorkerPortfolio', workerPortfolioSchema);