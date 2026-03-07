import { Router } from 'express';
import { getCategories, getCategoryById } from './category.controller.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;