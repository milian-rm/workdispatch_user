import { Router } from 'express';
import {
    requestMeeting,
    proposeAlternativeTime,
    confirmMeeting,
    getPendingMeetings,
    getMeetingsByUser,
    getProposalMeeting,
    getServiceRequestMeeting,
    getMeetingById,
    cancelMeeting,
    workerRequestMeeting
} from './meeting.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.post('/request', validateJWT, requestMeeting);
router.post('/worker-request', validateJWT, workerRequestMeeting);
router.patch('/propose-time/:id', validateJWT, proposeAlternativeTime);
router.patch('/confirm/:id', validateJWT, confirmMeeting);
router.get('/pending/:userId', validateJWT, getPendingMeetings);
router.get('/user/:userId', validateJWT, getMeetingsByUser);
router.get('/proposal/:proposalId', validateJWT, getProposalMeeting);
router.get('/service-request/:serviceRequestId', validateJWT, getServiceRequestMeeting);
router.get('/:id', validateJWT, getMeetingById);
router.patch('/cancel/:id', validateJWT, cancelMeeting);

export default router;
