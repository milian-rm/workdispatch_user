import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
    reporterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID de quien reporta es obligatorio']
    },
    reporteredId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del usuario reportado es obligatorio']
    },
    Reason: {
        type: String,
        required: [true, 'La razón del reporte es obligatoria']
    },
    Description: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    Status: {
        type: Boolean,
        default: true // true = Pendiente/Activo, false = Resuelto/Desactivado
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Report', reportSchema);