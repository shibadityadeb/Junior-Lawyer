import { Router } from 'express';
import { listCategories } from '../controllers/categories.controller';

const router = Router();

// GET /api/categories - List legal categories
router.get('/', listCategories);

export default router;
