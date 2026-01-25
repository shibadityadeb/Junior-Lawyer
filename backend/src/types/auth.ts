import { Request } from 'express';

// Auth request/response types
export interface SignupRequest {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleCallbackQuery {
  code?: string;
  error?: string;
  error_description?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      user_metadata?: Record<string, any>;
    };
    session?: {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };
  };
  error?: string;
}

// Extended Express Request with user context
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_metadata?: Record<string, any>;
    profile?: {
      name: string;
      age: number | null;
      gender: 'male' | 'female' | 'other' | null;
    };
  };
}

// Auth error types
export interface AuthError {
  statusCode: number;
  message: string;
  code?: string;
}
