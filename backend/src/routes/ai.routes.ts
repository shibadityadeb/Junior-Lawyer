import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as os from 'os';
import type { FileFilterCallback } from 'multer';
import { chatWithAI, processVoice, processDocument } from '../controllers/ai.controller';

const router = Router();

// Configure multer for file uploads in chat
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
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
router.post('/chat', upload.array('files', 2), chatWithAI);

// POST /api/ai/voice - Voice input processing
router.post('/voice', processVoice);

// POST /api/ai/document - Document upload and analysis
router.post('/document', processDocument);

export default router;
