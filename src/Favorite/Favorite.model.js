'use strict';

import { Schema, model } from 'mongoose';

const favoriteSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del cliente es obligatorio']
    },
    workerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del trabajador es obligatorio']
    }
}, {
    timestamps: true,
    versionKey: false
});

favoriteSchema.index({ clientId: 1, workerId: 1 }, { unique: true });

export default model('Favorite', favoriteSchema);
