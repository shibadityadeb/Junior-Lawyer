import { Response, NextFunction, Request } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Extended Request type with auth information and file uploads
 */
export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId?: string;
  };
  files?: any[];
  file?: any;
}

/**
 * Auth middleware to verify Clerk JWT token
 * Extracts and validates JWT token from Authorization header
 * Attaches userId to request object
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization header missing',
        error: 'NO_AUTH_HEADER',
      });
      return;
    }

    // Extract Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
        error: 'INVALID_AUTH_FORMAT',
      });
      return;
    }

    const token = parts[1];

    try {
      // Verify token with Clerk
      const decoded = await clerkClient.verifyToken(token);
      
      if (!decoded.sub) {
        throw new Error('No user ID in token');
      }

      // Attach user info to request (cast to AuthenticatedRequest for runtime)
      const authReq = req as AuthenticatedRequest;
      authReq.auth = {
        userId: decoded.sub,
        sessionId: decoded.sid,
      };

      next();
    } catch (verifyError) {
      console.error('Clerk token verification error:', verifyError);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN',
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: 'INTERNAL_AUTH_ERROR',
    });
  }
};

