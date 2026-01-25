import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { SignupRequest, LoginRequest, AuthResponse, AuthenticatedRequest } from '../types/auth';
import { signupSchema, loginSchema, SignupRequestData, LoginRequestData } from '../utils/validation';
import { createProfile, getProfileById, createGoogleProfile } from '../services/profile.service';
import { ZodError } from 'zod';

/**
 * User signup handler with extended profile data
 * Creates a new user account with email, password and profile information
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    let validatedData: SignupRequestData;
    try {
      validatedData = signupSchema.parse(req.body);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => issue.message).join(', ');
        res.status(400).json({
          success: false,
          message: errorMessages,
          error: 'VALIDATION_ERROR',
        } as AuthResponse);
        return;
      }
      throw error;
    }

    const { email, password, name, age, gender } = validatedData;

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // Store name in user metadata
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create account',
        error: error.code || 'SIGNUP_ERROR',
      } as AuthResponse);
      return;
    }

    if (!data.user?.id) {
      res.status(400).json({
        success: false,
        message: 'User created but user ID not returned',
        error: 'SIGNUP_ERROR',
      } as AuthResponse);
      return;
    }

    // Create user profile
    try {
      await createProfile({
        id: data.user.id,
        name,
        age,
        gender,
      });
    } catch (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail signup if profile creation fails, but log it
      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email to verify. (Note: Profile creation may have failed)',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata,
          },
          session: data.session
            ? {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token || undefined,
                expires_in: data.session.expires_in || 3600,
              }
            : undefined,
        },
      } as AuthResponse);
      return;
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify.',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        },
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token || undefined,
              expires_in: data.session.expires_in || 3600,
            }
          : undefined,
      },
    } as AuthResponse);
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    } as AuthResponse);
  }
};

/**
 * User login handler
 * Authenticates user with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    let validatedData: LoginRequestData;
    try {
      validatedData = loginSchema.parse(req.body);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => issue.message).join(', ');
        res.status(400).json({
          success: false,
          message: errorMessages,
          error: 'VALIDATION_ERROR',
        } as AuthResponse);
        return;
      }
      throw error;
    }

    const { email, password } = validatedData;

    // Sign in user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      const statusCode = error.code === 'invalid_credentials' ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        message:
          error.code === 'invalid_credentials'
            ? 'Invalid email or password'
            : error.message || 'Failed to login',
        error: error.code || 'LOGIN_ERROR',
      } as AuthResponse);
      return;
    }

    // Return success response with session
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          user_metadata: data.user?.user_metadata,
        },
        session: {
          access_token: data.session?.access_token || '',
          refresh_token: data.session?.refresh_token || undefined,
          expires_in: data.session?.expires_in || 3600,
        },
      },
    } as AuthResponse);
  } catch (error) {
    console.error('Unexpected error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    } as AuthResponse);
  }
};

/**
 * User logout handler
 * Invalidates the user's session
 */
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Sign out user with Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to logout',
        error: error.code || 'LOGOUT_ERROR',
      } as AuthResponse);
      return;
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    } as AuthResponse);
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    } as AuthResponse);
  }
};

/**
 * Get current user info
 * Returns the authenticated user's information
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
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
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
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
 * Initiate Google OAuth login
 * Redirects user to Supabase OAuth provider
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const redirectUrl = process.env.SUPABASE_GOOGLE_REDIRECT_URL;

    if (!redirectUrl) {
      res.status(500).json({
        success: false,
        message: 'Google redirect URL not configured',
        error: 'CONFIG_ERROR',
      } as AuthResponse);
      return;
    }

    // Get OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to initiate Google login',
        error: 'GOOGLE_AUTH_ERROR',
      } as AuthResponse);
      return;
    }

    // Return the OAuth URL
    res.status(200).json({
      success: true,
      message: 'Google OAuth URL generated',
      data: {
        url: data.url,
      },
    });
  } catch (error) {
    console.error('Unexpected error in googleLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    } as AuthResponse);
  }
};

/**
 * Handle Google OAuth callback
 * Creates or updates user profile after OAuth login
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, error, error_description } = req.query as {
      code?: string;
      error?: string;
      error_description?: string;
    };

    // Check for OAuth errors
    if (error) {
      console.error('Google OAuth error:', error_description);
      res.status(400).json({
        success: false,
        message: error_description || 'Google authentication failed',
        error: 'GOOGLE_AUTH_ERROR',
      } as AuthResponse);
      return;
    }

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Missing authorization code',
        error: 'INVALID_REQUEST',
      } as AuthResponse);
      return;
    }

    // Exchange code for session using Supabase
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      res.status(400).json({
        success: false,
        message: sessionError.message || 'Failed to exchange code for session',
        error: 'SESSION_ERROR',
      } as AuthResponse);
      return;
    }

    if (!data.user) {
      res.status(400).json({
        success: false,
        message: 'User data not available',
        error: 'INVALID_USER',
      } as AuthResponse);
      return;
    }

    // Create or update profile for Google user
    const userName = data.user.user_metadata?.full_name || data.user.email || 'Google User';
    const userEmail = data.user.email || '';

    try {
      await createGoogleProfile(data.user.id, userName, userEmail);
    } catch (profileError) {
      console.error('Error creating Google profile:', profileError);
      // Continue even if profile creation fails - user is still authenticated
    }

    // Return success with session
    res.status(200).json({
      success: true,
      message: 'Logged in with Google successfully',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        },
        session: {
          access_token: data.session?.access_token || '',
          refresh_token: data.session?.refresh_token || undefined,
          expires_in: data.session?.expires_in || 3600,
        },
      },
    } as AuthResponse);
  } catch (error) {
    console.error('Unexpected error in googleCallback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    } as AuthResponse);
  }
};

