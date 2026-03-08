import { Router } from 'express';
import { createReview, getClientReviews, editReview, getWorkerReviews } from './review.controller.js';
import { createReviewValidator, editReviewValidator, getReviewsValidator } from '../../middlewares/review-validator.js';

const router = Router();

// Rutas para el CLIENT y WORKER
router.post(
    '/', 
    createReviewValidator, 
    createReview
);
router.get(
    '/client/:clientId', 
    getReviewsValidator, 
    getClientReviews
);
router.put(
    '/:id', 
    editReviewValidator, 
    editReview
);
router.get(
    '/worker/:workerId', 
    getReviewsValidator, 
    getWorkerReviews
);

export default router;