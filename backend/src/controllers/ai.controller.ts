import { Request, Response } from 'express';
import { anthropicService } from '../services/anthropic.service';
import type { AuthenticatedRequest } from '../types/auth';

/**
 * Chat with AI endpoint
 * Processes legal questions through Anthropic Claude
 * Protected route - requires Clerk authentication
 */
export const chatWithAI = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    // Validate message field
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message field is required and must be a non-empty string',
      });
      return;
    }

    // Get authenticated user ID from Clerk
    const userId = req.auth?.userId;

    // Process question through Claude
    const aiResponse = await anthropicService.askLegalQuestion(message);

    // Return formatted response
    res.status(200).json({
      success: true,
      data: {
        id: Math.random().toString(36).substr(2, 9),
        userId: userId || 'unknown',
        userMessage: message,
        aiResponse: aiResponse,
        timestamp: new Date().toISOString(),
      },
      message: 'Legal question processed successfully',
    });
  } catch (error) {
    console.error('❌ Error in chatWithAI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if API key is missing (500)
    if (errorMessage.includes('ANTHROPIC_API_KEY')) {
      console.error('🔴 Claude API key is not configured');
      res.status(500).json({
        success: false,
        message: 'AI service is not properly configured. Please contact support.',
        error: 'MISSING_API_KEY',
      });
      return;
    }

    // Check if Claude API failed (502 - Bad Gateway)
    if (errorMessage.includes('Claude API failed')) {
      console.error('🔴 Claude API call failed after retries');
      res.status(502).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again in a moment.',
        error: 'SERVICE_UNAVAILABLE',
      });
      return;
    }

    // Check if response validation failed (502)
    if (errorMessage.includes('Response validation failed')) {
      console.error('🔴 Claude response validation failed');
      res.status(502).json({
        success: false,
        message: 'AI service returned invalid response. Please try again.',
        error: 'INVALID_RESPONSE',
      });
      return;
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Error processing chat request',
      error: errorMessage,
    });
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
