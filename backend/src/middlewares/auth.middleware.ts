import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { supabase } from '../config/supabase';

/**
 * Auth middleware to verify user authentication
 * Extracts and validates JWT token from Authorization header
 * Attaches user information to request object
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
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

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('Token validation error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN',
      });
      return;
    }

    // Attach user information to request object
    req.user = {
      id: data.user.id,
      email: data.user.email || '',
      user_metadata: data.user.user_metadata,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Optional auth middleware
 * Does not reject requests without auth, but populates user if token is valid
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user info
    if (!authHeader) {
      return next();
    }

    // Extract Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      // Invalid format but don't reject, just continue
      return next();
    }

    const token = parts[1];

    // Verify token with Supabase
    const { data } = await supabase.auth.getUser(token);

    // If valid, attach user info
    if (data.user) {
      req.user = {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata,
      };
    }

    next();
  } catch (error) {
    // Log but don't reject
    console.error('Optional auth middleware error:', error);
    next();
  }
};
