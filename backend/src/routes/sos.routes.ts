import { Router } from 'express';
import { listSOSHelp } from '../controllers/sos.controller';

const router = Router();

// GET /api/sos - List emergency legal help information
router.get('/', listSOSHelp);

export default router;
