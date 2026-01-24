import { Router } from 'express';
import { listNews } from '../controllers/news.controller';

const router = Router();

// GET /api/news - List legal news
router.get('/', listNews);

export default router;
