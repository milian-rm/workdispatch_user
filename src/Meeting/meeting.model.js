import { Schema, model } from 'mongoose';

const meetingSchema = Schema({
    proposalId: {
        type: Schema.Types.ObjectId,
        ref: 'Proposal',
        default: null
    },
    serviceRequestId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'El ID de la solicitud es obligatorio']
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        default: null
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del cliente es obligatorio']
    },
    workerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del trabajador es obligatorio']
    },
    requestedBy: {
        type: String,
        enum: ['CLIENT', 'WORKER'],
        required: [true, 'Quién solicitó la entrevista es obligatorio']
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
        default: 'PENDING'
    },
    confirmedByClient: {
        type: Boolean,
        default: false
    },
    confirmedByWorker: {
        type: Boolean,
        default: false
    },
    meetLink: {
        type: String,
        default: null
    },
    eventId: {
        type: String,
        default: null
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    lastProposedBy: {
        type: String,
        enum: ['CLIENT', 'WORKER', null],
        default: null
    },
    suggestedDates: [{
        date: { type: Date, required: true },
        proposedBy: { type: String, enum: ['CLIENT', 'WORKER'] }
    }]
}, { versionKey: false, timestamps: true });

export default model('Meeting', meetingSchema);
