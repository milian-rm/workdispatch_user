'use strict';

import { Router } from 'express';
import { addFavorite, removeFavorite, getFavoritesByClient } from './Favorite.controller.js';
import { validateAddFavorite, validateFavoriteParams } from '../../middlewares/favorite-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';

const router = Router();

router.post('/', validateJWT, validateAddFavorite, addFavorite);
router.delete('/:clientId/:workerId', validateJWT, validateFavoriteParams, removeFavorite);
router.get('/client/:clientId', validateJWT, getFavoritesByClient);

export default router;
