import 'express';
import type { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: any;
      files?: any[];
    }
  }
}
