import { google } from 'googleapis';
import Meeting from './meeting.model.js';
import Proposal from '../Proposal/Proposal.model.js';
import ServiceRequest from '../ServiceRequest/serviceRequest.model.js';
import Service from '../Service/Service.model.js';
import User from '../Users/user.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

const getAuthClient = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    });
    return oauth2Client;
};

const CONFERENCE_TYPES = ['hangoutsMeet', 'eventNamedHangout', 'eventHangout'];

const getAllowedConferenceTypes = async (calendar) => {
    try {
        const res = await calendar.calendarList.get({ calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary' });
        return res.data.conferenceProperties?.allowedConferenceSolutionTypes || [];
    } catch {
        return [];
    }
};

const generateGoogleMeet = async ({ proposal, client, worker, serviceRequest, startTime }) => {
    const startDate = startTime || new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const auth = getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const allowed = await getAllowedConferenceTypes(calendar);
    const typesToTry = allowed.length > 0
        ? allowed.filter(t => CONFERENCE_TYPES.includes(t))
        : CONFERENCE_TYPES;

    const event = {
        summary: `Entrevista WorkDispatch: ${serviceRequest?.title || 'Servicio'}`,
        description: `Entrevista entre ${client.firstName} ${client.lastName} y ${worker.firstName} ${worker.lastName} para el servicio "${serviceRequest?.title || ''}".`,
        attendees: [
            { email: client.email, displayName: `${client.firstName} ${client.lastName}` },
            { email: worker.email, displayName: `${worker.firstName} ${worker.lastName}` }
        ],
        start: { dateTime: startDate.toISOString(), timeZone: 'America/Guatemala' },
        end: { dateTime: endDate.toISOString(), timeZone: 'America/Guatemala' },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 30 },
                { method: 'popup', minutes: 10 }
            ]
        }
    };

    let calendarEvent;
    let lastError;

    for (const conferenceType of typesToTry) {
        const eventWithConference = {
            ...event,
            conferenceData: {
                createRequest: {
                    requestId: `${proposal._id}-${Date.now()}-${conferenceType}`,
                    conferenceSolutionKey: { type: conferenceType }
                }
            }
        };

        try {
            calendarEvent = await calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
                requestBody: eventWithConference,
                conferenceDataVersion: 1,
                sendUpdates: 'all'
            });
            lastError = null;
            break;
        } catch (googleError) {
            lastError = googleError;
            console.warn(`Conference type "${conferenceType}" failed:`, googleError.message);
        }
    }

    if (!calendarEvent && typesToTry.length > 0) {
        console.warn('All conference types failed, creating event without Meet link.');
        try {
            calendarEvent = await calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
                requestBody: event,
                sendUpdates: 'all'
            });
        } catch (fallbackError) {
            calendarEvent = await calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
                requestBody: event
            });
        }
    }

    if (!calendarEvent) {
        throw lastError || new Error('No se pudo crear el evento en Google Calendar');
    }

    const meetLink = calendarEvent.data.hangoutLink ||
        calendarEvent.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri ||
        null;

    return {
        meetLink,
        eventId: calendarEvent.data.id,
        startTime: startDate,
        endDate: endDate
    };
};

export const requestMeeting = async (req, res) => {
    try {
        const { proposalId, startTime } = req.body;

        if (!proposalId) {
            return res.status(400).json({
                success: false,
                message: 'proposalId es obligatorio'
            });
        }

        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Propuesta no encontrada' });
        }
        if (proposal.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden solicitar entrevistas en propuestas pendientes'
            });
        }

        const serviceRequest = await ServiceRequest.findById(proposal.serviceRequestId);
        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        if (serviceRequest.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Solo el cliente puede solicitar una entrevista en esta propuesta'
            });
        }

        const existingMeeting = await Meeting.findOne({
            proposalId,
            status: { $in: ['PENDING', 'CONFIRMED'] }
        });
        if (existingMeeting) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entrevista pendiente o confirmada para esta propuesta'
            });
        }

        const agreedDate = startTime ? new Date(startTime) : null;
        if (startTime && isNaN(agreedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'startTime no es una fecha válida'
            });
        }

        const meeting = new Meeting({
            proposalId: proposal._id,
            serviceRequestId: proposal.serviceRequestId,
            clientId: serviceRequest.clientId,
            workerId: proposal.workerId,
            requestedBy: 'CLIENT',
            status: 'PENDING',
            confirmedByClient: true,
            confirmedByWorker: false,
            startTime: agreedDate,
            lastProposedBy: 'CLIENT'
        });
        await meeting.save();

        await createAutomaticNotification(
            proposal.workerId,
            startTime
                ? `Te han solicitado una entrevista para el ${new Date(startTime).toLocaleString('es-GT')}. ¡Confirma tu asistencia!`
                : 'Te han solicitado una entrevista para tu propuesta.',
            'MEETING_REQUESTED',
            meeting._id
        );

        await meeting.populate([
            { path: 'proposalId', select: 'price message status' },
            { path: 'clientId', select: 'firstName lastName profilePhoto' },
            { path: 'workerId', select: 'firstName lastName profilePhoto' },
            { path: 'serviceRequestId', select: 'title description address budgetMin budgetMax' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Entrevista solicitada exitosamente. Esperando confirmación del trabajador.',
            data: meeting
        });
    } catch (error) {
        console.error('Error al solicitar entrevista:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al solicitar la entrevista',
            error: error.message
        });
    }
};

export const proposeAlternativeTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime } = req.body;
        const userId = req.user._id;

        if (!startTime) {
            return res.status(400).json({
                success: false,
                message: 'startTime es obligatorio'
            });
        }

        const agreedDate = new Date(startTime);
        if (isNaN(agreedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'startTime no es una fecha válida'
            });
        }

        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Entrevista no encontrada' });
        }
        if (meeting.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden proponer cambios en entrevistas pendientes'
            });
        }

        const isClient = meeting.clientId.toString() === userId.toString();
        const isWorker = meeting.workerId.toString() === userId.toString();
        if (!isClient && !isWorker) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para proponer un horario en esta entrevista'
            });
        }

        meeting.startTime = agreedDate;
        meeting.lastProposedBy = isClient ? 'CLIENT' : 'WORKER';

        if (isClient) {
            meeting.confirmedByClient = true;
            meeting.confirmedByWorker = false;
        } else {
            meeting.confirmedByClient = false;
            meeting.confirmedByWorker = true;
        }

        await meeting.save();

        const notifyUserId = isClient ? meeting.workerId : meeting.clientId;
        await createAutomaticNotification(
            notifyUserId,
            `Se propuso un nuevo horario para la entrevista: ${agreedDate.toLocaleString('es-GT')}. Revisa y confirma.`,
            'MEETING_TIME_PROPOSED',
            meeting._id
        );

        await meeting.populate([
            { path: 'proposalId', select: 'price message status' },
            { path: 'clientId', select: 'firstName lastName profilePhoto' },
            { path: 'workerId', select: 'firstName lastName profilePhoto' },
            { path: 'serviceRequestId', select: 'title description address budgetMin budgetMax' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Nuevo horario propuesto. Esperando confirmación de la otra parte.',
            data: meeting
        });
    } catch (error) {
        console.error('Error al proponer horario:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al proponer el horario',
            error: error.message
        });
    }
};

export const confirmMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Entrevista no encontrada' });
        }
        if (meeting.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden confirmar entrevistas pendientes'
            });
        }

        const isClient = meeting.clientId.toString() === userId.toString();
        const isWorker = meeting.workerId.toString() === userId.toString();
        if (!isClient && !isWorker) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para confirmar esta entrevista'
            });
        }

        if (isClient && meeting.confirmedByClient) {
            return res.status(400).json({
                success: false,
                message: 'Ya has confirmado tu asistencia a esta entrevista'
            });
        }
        if (isWorker && meeting.confirmedByWorker) {
            return res.status(400).json({
                success: false,
                message: 'Ya has confirmado tu asistencia a esta entrevista'
            });
        }

        if (isClient) meeting.confirmedByClient = true;
        if (isWorker) meeting.confirmedByWorker = true;

        const bothConfirmed = meeting.confirmedByClient && meeting.confirmedByWorker;
        if (bothConfirmed) {
            const proposal = await Proposal.findById(meeting.proposalId);
            const serviceRequest = await ServiceRequest.findById(meeting.serviceRequestId);
            const client = await User.findById(meeting.clientId).select('email firstName lastName');
            const worker = await User.findById(meeting.workerId).select('email firstName lastName');

            if (proposal && serviceRequest && client && worker) {
                try {
                    const googleData = await generateGoogleMeet({
                        proposal,
                        client,
                        worker,
                        serviceRequest,
                        startTime: meeting.startTime
                    });
                    meeting.meetLink = googleData.meetLink;
                    meeting.eventId = googleData.eventId;
                    meeting.endTime = googleData.endDate;
                } catch (googleError) {
                    console.error('Error al generar Google Meet:', googleError.message);
                }
            }

            meeting.status = 'CONFIRMED';

            await createAutomaticNotification(
                meeting.clientId,
                '¡Entrevista confirmada! Ya puedes ver el enlace de Google Meet.',
                'MEETING_CONFIRMED',
                meeting._id
            );
            await createAutomaticNotification(
                meeting.workerId,
                '¡Entrevista confirmada! Ya puedes ver el enlace de Google Meet.',
                'MEETING_CONFIRMED',
                meeting._id
            );
        } else {
            const whoConfirmed = isClient ? 'El cliente' : 'El trabajador';
            const notifyUserId = isClient ? meeting.workerId : meeting.clientId;
            await createAutomaticNotification(
                notifyUserId,
                `${whoConfirmed} confirmó su asistencia a la entrevista. ¡Falta tu confirmación!`,
                'MEETING_CONFIRMATION_PENDING',
                meeting._id
            );
        }

        await meeting.save();

        await meeting.populate([
            { path: 'proposalId', select: 'price message status' },
            { path: 'clientId', select: 'firstName lastName profilePhoto' },
            { path: 'workerId', select: 'firstName lastName profilePhoto' },
            { path: 'serviceRequestId', select: 'title description address budgetMin budgetMax' }
        ]);

        res.status(200).json({
            success: true,
            message: bothConfirmed
                ? 'Ambos confirmaron. La entrevista ha sido agendada con Google Meet.'
                : 'Asistencia confirmada. Esperando la confirmación de la otra parte.',
            data: meeting
        });
    } catch (error) {
        console.error('Error al confirmar entrevista:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar la entrevista',
            error: error.message
        });
    }
};

export const getPendingMeetings = async (req, res) => {
    try {
        const { userId } = req.params;

        const meetings = await Meeting.find({
            $or: [
                { clientId: userId, confirmedByClient: false, status: 'PENDING' },
                { workerId: userId, confirmedByWorker: false, status: 'PENDING' }
            ]
        })
            .populate('proposalId', 'price message status')
            .populate('clientId', 'firstName lastName profilePhoto')
            .populate('workerId', 'firstName lastName profilePhoto')
            .populate({
                path: 'serviceRequestId',
                select: 'title description address budgetMin budgetMax'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, meetings });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener entrevistas pendientes',
            error: error.message
        });
    }
};

export const getMeetingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const meetings = await Meeting.find({
            $or: [{ clientId: userId }, { workerId: userId }]
        })
            .populate('proposalId', 'price message status')
            .populate('clientId', 'firstName lastName profilePhoto')
            .populate('workerId', 'firstName lastName profilePhoto')
            .populate({
                path: 'serviceRequestId',
                select: 'title description address budgetMin budgetMax'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, meetings });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las entrevistas',
            error: error.message
        });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await Meeting.findById(id)
            .populate('proposalId', 'price message status')
            .populate('clientId', 'firstName lastName profilePhoto')
            .populate('workerId', 'firstName lastName profilePhoto')
            .populate({
                path: 'serviceRequestId',
                select: 'title description address budgetMin budgetMax'
            });

        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Entrevista no encontrada' });
        }

        const isClient = meeting.clientId._id.toString() === req.user._id.toString();
        const isWorker = meeting.workerId._id.toString() === req.user._id.toString();
        if (!isClient && !isWorker) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta entrevista' });
        }

        res.status(200).json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la entrevista', error: error.message });
    }
};

export const getServiceRequestMeeting = async (req, res) => {
    try {
        const { serviceRequestId } = req.params;

        const meeting = await Meeting.findOne({ serviceRequestId })
            .populate('proposalId', 'price message status')
            .populate('clientId', 'firstName lastName profilePhoto')
            .populate('workerId', 'firstName lastName profilePhoto')
            .populate({
                path: 'serviceRequestId',
                select: 'title'
            });

        res.status(200).json({
            success: true,
            data: meeting || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la entrevista',
            error: error.message
        });
    }
};

export const getProposalMeeting = async (req, res) => {
    try {
        const { proposalId } = req.params;

        const meeting = await Meeting.findOne({ proposalId })
            .populate('proposalId', 'price message status')
            .populate('clientId', 'firstName lastName profilePhoto')
            .populate('workerId', 'firstName lastName profilePhoto')
            .populate({
                path: 'serviceRequestId',
                select: 'title'
            });

        res.status(200).json({
            success: true,
            data: meeting || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la entrevista',
            error: error.message
        });
    }
};

export const cancelMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: 'Entrevista no encontrada' });
        }

        const isClient = meeting.clientId.toString() === userId.toString();
        const isWorker = meeting.workerId.toString() === userId.toString();
        if (!isClient && !isWorker) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para cancelar esta entrevista'
            });
        }

        if (meeting.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: 'La entrevista ya está cancelada' });
        }

        if (meeting.eventId) {
            try {
                const auth = getAuthClient();
                const calendar = google.calendar({ version: 'v3', auth });
                await calendar.events.delete({
                    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
                    eventId: meeting.eventId,
                    sendUpdates: 'all'
                });
            } catch (googleError) {
                console.warn('No se pudo eliminar el evento de Calendar:', googleError.message);
            }
        }

        meeting.status = 'CANCELLED';
        await meeting.save();

        const notifyUserId = isClient ? meeting.workerId : meeting.clientId;
        await createAutomaticNotification(
            notifyUserId,
            'La entrevista programada ha sido cancelada.',
            'MEETING_CANCELLED',
            meeting._id
        );

        res.status(200).json({ success: true, message: 'Entrevista cancelada', data: meeting });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la entrevista',
            error: error.message
        });
    }
};

export const workerRequestMeeting = async (req, res) => {
    try {
        const { serviceRequestId, startTime } = req.body;
        const workerId = req.user._id;

        const serviceRequest = await ServiceRequest.findById(serviceRequestId)
            .populate('clientId', 'firstName lastName email');
        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Solicitud de servicio no encontrada' });
        }

        const existing = await Meeting.findOne({
            serviceRequestId,
            workerId,
            status: { $in: ['PENDING', 'CONFIRMED'] }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Ya tienes una entrevista activa para esta solicitud' });
        }

        const meetingData = {
            clientId: serviceRequest.clientId._id,
            workerId,
            serviceRequestId,
            status: 'PENDING',
            requestedBy: 'WORKER'
        };
        if (startTime) {
            meetingData.startTime = new Date(startTime);
        }

        const meeting = new Meeting(meetingData);
        await meeting.save();

        const workerUser = await User.findById(workerId).select('firstName lastName');
        const workerName = workerUser ? `${workerUser.firstName} ${workerUser.lastName}`.trim() : 'Un trabajador';

        await createAutomaticNotification(
            serviceRequest.clientId._id,
            `${workerName} ha solicitado una entrevista.`,
            'MEETING_REQUEST',
            meeting._id
        );

        res.status(201).json({
            success: true,
            message: 'Solicitud de entrevista enviada',
            data: meeting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al solicitar la entrevista',
            error: error.message
        });
    }
};
