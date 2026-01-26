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
// AuthenticatedRequest is defined in middlewares/auth.middleware.ts
// Import it from there instead of defining it here

// Auth error types
export interface AuthError {
  statusCode: number;
  message: string;
  code?: string;
}
