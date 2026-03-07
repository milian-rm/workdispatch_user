import Review from './review.model.js';

export const createReview = async (req, res) => {
    try {
        const data = req.body;
        const review = new Review(data);
        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review creada exitosamente',
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la review',
            error: error.message
        });
    }
};

export const getClientReviews = async (req, res) => {
    try {
        const { clientId } = req.params;
        const reviews = await Review.find({ reviewerId: clientId })
            .populate('serviceId')
            .populate('revieweredId', 'firstName lastName');

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reviews del cliente',
            error: error.message
        });
    }
};

export const editReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { Rating, Comment } = req.body;

        const updatedReview = await Review.findByIdAndUpdate(
            id,
            { Rating, Comment },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ success: false, message: 'Review no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: 'Review actualizada',
            review: updatedReview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar la review',
            error: error.message
        });
    }
};

export const getWorkerReviews = async (req, res) => {
    try {
        const { workerId } = req.params;
        const reviews = await Review.find({ revieweredId: workerId })
            .populate('reviewerId', 'firstName lastName');

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reviews del trabajador',
            error: error.message
        });
    }
};