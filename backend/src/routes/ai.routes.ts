import { Router } from 'express';
import { chatWithAI, processVoice, processDocument } from '../controllers/ai.controller';

const router = Router();

// POST /api/ai/chat - Text-based chat with AI
router.post('/chat', chatWithAI);

// POST /api/ai/voice - Voice input processing
router.post('/voice', processVoice);

// POST /api/ai/document - Document upload and analysis
router.post('/document', processDocument);

export default router;
