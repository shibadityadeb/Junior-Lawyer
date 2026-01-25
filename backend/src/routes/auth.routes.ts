import { Router } from 'express';
import { signup, login, logout, getCurrentUser } from '../controllers/auth.controller';
// import { googleLogin, googleCallback } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/auth/signup
 * User signup endpoint with extended profile data
 * Body: { name, age, gender, email, password }
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * User login endpoint
 * Body: { email, password }
 * Returns: access_token, refresh_token, user info
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * User logout endpoint
 * Requires: Authorization header with Bearer token
 */
router.post('/logout', authMiddleware, logout);

/**
 * GET /api/auth/me
 * Get current authenticated user info
 * Requires: Authorization header with Bearer token
 */
router.get('/me', authMiddleware, getCurrentUser);


/**
 * GET /api/auth/google
 * Initiate Google OAuth login
 * Returns: OAuth URL to redirect user to
 * DISABLED: Uncomment to enable
 */
// router.get('/google', googleLogin);

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 * Query params: code, error, error_description
 * Returns: session tokens and user info
 * DISABLED: Uncomment to enable
 */
// router.get('/google/callback', googleCallback);

export default router;
