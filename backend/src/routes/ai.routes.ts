import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as os from 'os';
import { chatWithAI, processVoice, processDocument } from '../controllers/ai.controller';
import { rateLimitMiddleware } from '../middlewares/rateLimit';

const router = Router();

// Configure multer for file uploads in chat
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: any, cb: (error: Error | null, path: string) => void) => {
      cb(null, os.tmpdir());
    },
    filename: (req: Request, file: any, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  },
});

// POST /api/ai/chat - Text-based chat with AI (supports file uploads)
// Protected: Requires Clerk authentication
// Rate limited: 5 requests per 24 hours per user
router.post('/chat', rateLimitMiddleware, upload.array('files', 2), chatWithAI);

// POST /api/ai/voice - Voice input processing
router.post('/voice', processVoice);

// POST /api/ai/document - Document upload and analysis
router.post('/document', processDocument);

export default router;
