'use strict';

import Favorite from './Favorite.model.js';

export const addFavorite = async (req, res) => {
    try {
        const { clientId, workerId } = req.body;
        const favorite = await Favorite.findOneAndUpdate(
            { clientId, workerId },
            {},
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return res.status(201).send({ success: true, favorite });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al agregar favorito', err: err.message });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { clientId, workerId } = req.params;
        await Favorite.findOneAndDelete({ clientId, workerId });
        return res.send({ success: true });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al eliminar favorito', err: err.message });
    }
};

export const getFavoritesByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const favorites = await Favorite.find({ clientId })
            .populate('workerId', 'firstName lastName profilePhoto ratingAverage description address verificationStatus');
        return res.send({ success: true, favorites });
    } catch (err) {
        return res.status(500).send({ success: false, message: 'Error al obtener favoritos', err: err.message });
    }
};
