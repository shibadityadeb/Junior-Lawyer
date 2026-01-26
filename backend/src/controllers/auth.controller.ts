import { Request, Response } from 'express';
import { AuthResponse } from '../types/auth';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ZodError } from 'zod';

/**
 * User signup handler - DEPRECATED
 * Signup is now handled by Clerk on the frontend
 * This endpoint is kept for backward compatibility but not used
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Signup is now handled by Clerk. Use Clerk SignUp component on the frontend.',
    error: 'DEPRECATED_ENDPOINT',
  } as AuthResponse);
};

/**
 * User login handler - DEPRECATED
 * Login is now handled by Clerk on the frontend
 * This endpoint is kept for backward compatibility but not used
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Login is now handled by Clerk. Use Clerk SignIn component on the frontend.',
    error: 'DEPRECATED_ENDPOINT',
  } as AuthResponse);
};

/**
 * User logout handler - DEPRECATED
 * Logout is now handled by Clerk on the frontend
 * This endpoint is kept for backward compatibility but not used
 */
export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Logout is now handled by Clerk. Use Clerk UserButton component on the frontend.',
    error: 'DEPRECATED_ENDPOINT',
  } as AuthResponse);
};

/**
 * Get current user info
 * Returns the authenticated user's information from the Clerk token
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // User info is populated by auth middleware from Clerk token
    const authReq = req as AuthenticatedRequest;
    const { userId, sessionId } = authReq.auth || {};

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No authenticated user',
        error: 'NO_USER',
      } as AuthResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User information retrieved',
      data: {
        user: {
          id: userId,
          email: 'clerk-managed',
        },
      },
    } as AuthResponse);
  } catch (error) {
    console.error('Unexpected error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    } as AuthResponse);
  }
};

/**
 * Initiate Google OAuth login - DEPRECATED
 * Google login is now handled by Clerk on the frontend
 * This endpoint is kept for backward compatibility but not used
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Google login is now handled by Clerk. Use Clerk SignIn component with Google provider on the frontend.',
    error: 'DEPRECATED_ENDPOINT',
  } as AuthResponse);
};

/**
 * Handle Google OAuth callback - DEPRECATED
 * Google OAuth callback is now handled by Clerk on the frontend
 * This endpoint is kept for backward compatibility but not used
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({
    success: false,
    message: 'Google OAuth callback is now handled by Clerk. Redirect to frontend after authentication.',
    error: 'DEPRECATED_ENDPOINT',
  } as AuthResponse);
};

