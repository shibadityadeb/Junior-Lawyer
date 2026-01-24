import { Router } from 'express';
import { listSchemes } from '../controllers/schemes.controller';

const router = Router();

// GET /api/schemes - List all legal schemes
router.get('/', listSchemes);

export default router;
