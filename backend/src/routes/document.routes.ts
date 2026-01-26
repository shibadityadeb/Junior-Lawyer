import { Router, Request, Response } from 'express'
import multer from 'multer'
import * as path from 'path'
import * as os from 'os'
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware'
import {
  extractDocumentContent,
  processDocuments,
  formatDocumentsForContext,
  cleanupTempFiles,
} from '../services/document.service'

const router = Router()

// Apply CORS headers to all document routes
router.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Configure multer for temporary file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: any, cb: (error: Error | null, path: string) => void) => {
      // Store in system temp directory
      const tempDir = os.tmpdir()
      cb(null, tempDir)
    },
    filename: (req: Request, file: any, cb: (error: Error | null, filename: string) => void) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, uniqueSuffix + path.extname(file.originalname))
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max per file
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allowed file types
    const allowedMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.docx']
    const ext = path.extname(file.originalname).toLowerCase()

    if (allowedExtensions.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${ext}`))
    }
  },
})

/**
 * POST /api/documents/extract
 * Extract text content from uploaded documents
 */
router.post('/extract', authMiddleware, upload.array('files', 2), async (req: Request, res: Response) => {
  const tempFilePaths: string[] = []

  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.files || authReq.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    console.log(`[DocumentRoutes] Extracting text from ${authReq.files.length} file(s)`)

    // Convert multer files to format expected by service
    const files = (authReq.files as any[]).map((file) => ({
      path: file.path,
      originalName: file.originalname,
    }))

    // Track temp files for cleanup
    tempFilePaths.push(...files.map((f) => f.path))

    // Process documents
    const extractedDocuments = await processDocuments(files)

    // Format for Claude context
    const documentContext = formatDocumentsForContext(extractedDocuments)

    // Return extracted content and formatted context
    res.json({
      success: true,
      documents: extractedDocuments,
      context: documentContext,
    })
  } catch (error: any) {
    console.error('[DocumentRoutes] Error extracting documents:', error)

    res.status(400).json({
      error: error.message || 'Failed to extract documents',
    })
  } finally {
    // Cleanup temporary files
    await cleanupTempFiles(tempFilePaths)
  }
})

/**
 * POST /api/documents/validate
 * Validate uploaded files without processing
 */
router.post(
  '/validate',
  authMiddleware,
  upload.array('files', 2),
  async (req: Request, res: Response) => {
    const tempFilePaths: string[] = []

    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.files || authReq.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
      }

      const files = (authReq.files as any[]).map((file) => ({
        path: file.path,
        originalName: file.originalname,
        size: file.size,
      }))

      tempFilePaths.push(...files.map((f) => f.path))

      // Return file information
      res.json({
        success: true,
        files: files.map((f) => ({
          name: f.originalName,
          size: f.size,
          sizeFormatted: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        })),
      })
    } catch (error: any) {
      console.error('[DocumentRoutes] Error validating files:', error)
      res.status(400).json({ error: error.message || 'Failed to validate files' })
    } finally {
      await cleanupTempFiles(tempFilePaths)
    }
  }
)

export default router
