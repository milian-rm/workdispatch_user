import { Router } from 'express';
import { getCategories, getCategoryById } from './category.controller.js';
import { validateCategoryIdParam } from '../../middlewares/category-validator.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', validateCategoryIdParam, getCategoryById);

export default router;