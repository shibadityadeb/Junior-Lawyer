import { Request, Response } from 'express';
import { anthropicService } from '../services/anthropic.service';
import { processDocuments, formatDocumentsForContext, cleanupTempFiles } from '../services/document.service';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Chat with AI endpoint
 * Processes legal questions through Anthropic Claude
 * Supports optional file uploads for document-aware responses
 * Protected route - requires Clerk authentication
 */
export const chatWithAI = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tempFilePaths: string[] = [];
  
  try {
    const authReq = req as AuthenticatedRequest;
    const { message, documentContext } = req.body;
    const uploadedFiles = req.files as any[] | undefined;

    // Validate message field
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message field is required and must be a non-empty string',
      });
      return;
    }

    // Get authenticated user ID from Clerk
    const userId = authReq.auth?.userId;

    // Process uploaded files if any
    let extractedContext = documentContext || '';
    let usedDocuments = !!documentContext && documentContext.length > 0;

    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        console.log(`[ChatWithAI] Processing ${uploadedFiles.length} uploaded file(s)`);
        
        // Track files for cleanup
        tempFilePaths.push(...uploadedFiles.map(f => f.path));

        // Convert multer files to format expected by service
        const files = uploadedFiles.map((file) => ({
          path: file.path,
          originalName: file.originalname,
        }));

        // Extract document content
        const extractedDocuments = await processDocuments(files);
        
        // Format for Claude context
        extractedContext = formatDocumentsForContext(extractedDocuments);
        usedDocuments = true;

        console.log(`[ChatWithAI] Successfully extracted context from ${files.length} file(s)`);
      } catch (fileError: any) {
        console.error('[ChatWithAI] Error processing files:', fileError);
        // Continue with message even if file processing fails
        console.log('[ChatWithAI] Continuing with message-only response');
      }
    }

    // Process question through Claude with optional document context
    const aiResponse = await anthropicService.askLegalQuestion(message, extractedContext);

    // Return formatted response
    res.status(200).json({
      success: true,
      data: {
        id: Math.random().toString(36).substr(2, 9),
        userId: userId || 'unknown',
        userMessage: message,
        aiResponse: aiResponse,
        usedDocuments: usedDocuments,
        timestamp: new Date().toISOString(),
      },
      message: 'Legal question processed successfully',
    });
  } catch (error: any) {
    console.error('❌ Error in chatWithAI:', error?.message || error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if API key is invalid or missing (500)
    if (errorMessage.includes('ANTHROPIC_API_KEY') || errorMessage.includes('invalid') && errorMessage.includes('API')) {
      console.error('🔴 Claude API key issue:', errorMessage);
      res.status(500).json({
        success: false,
        message: 'AI service is not properly configured. Please contact support.',
        error: 'API_KEY_ERROR',
      });
      return;
    }

    // Check if authentication failed with Anthropic
    if (error?.status === 401 || errorMessage.includes('401')) {
      console.error('🔴 Anthropic authentication failed');
      res.status(500).json({
        success: false,
        message: 'AI service authentication failed. Please contact support.',
        error: 'AUTH_ERROR',
      });
      return;
    }

    // Check if rate limited by Anthropic
    if (error?.status === 429 || errorMessage.includes('rate limit')) {
      console.error('🔴 Anthropic rate limit exceeded');
      res.status(429).json({
        success: false,
        message: 'AI service is temporarily rate limited. Please try again in a moment.',
        error: 'RATE_LIMITED',
      });
      return;
    }

    // Check if Claude API failed (502 - Bad Gateway)
    if (errorMessage.includes('Claude API failed') || errorMessage.includes('timeout')) {
      console.error('🔴 Claude API call failed after retries');
      res.status(502).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again in a moment.',
        error: 'SERVICE_UNAVAILABLE',
      });
      return;
    }

    // Check if JSON parsing failed
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      console.error('🔴 Claude response parsing failed');
      res.status(502).json({
        success: false,
        message: 'AI service returned malformed response. Please try again.',
        error: 'PARSE_ERROR',
      });
      return;
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Error processing chat request. Please try again.',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'INTERNAL_ERROR',
    });
  } finally {
    // Cleanup temporary files
    if (tempFilePaths.length > 0) {
      try {
        await cleanupTempFiles(tempFilePaths);
      } catch (cleanupError) {
        console.error('[ChatWithAI] Error cleaning up temp files:', cleanupError);
      }
    }
  }
};

export const processVoice = async (req: Request, res: Response): Promise<void> => {
  try {
    // Placeholder response for voice endpoint
    const response = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'received',
      message: 'Voice input received and queued for processing',
      transcription: 'Placeholder transcription',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Voice request received',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing voice request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const processDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    // Placeholder response for document endpoint
    const response = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'received',
      message: 'Document uploaded and queued for analysis',
      documentName: req.body.documentName || 'uploaded_document',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Document request received',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing document request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
