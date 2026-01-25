import { z } from 'zod';

// Signup validation schema
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(13, 'Age must be at least 13'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Profile update validation schema
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  age: z.number().int().min(13, 'Age must be at least 13').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

// Type exports for use in controllers
export type SignupRequestData = z.infer<typeof signupSchema>;
export type LoginRequestData = z.infer<typeof loginSchema>;
export type UpdateProfileRequestData = z.infer<typeof updateProfileSchema>;
