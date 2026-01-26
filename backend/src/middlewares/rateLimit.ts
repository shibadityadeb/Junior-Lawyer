import { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from './auth.middleware'

interface RateLimitStore {
  [userId: string]: {
    count: number
    firstRequestTime: number
  }
}

// In-memory store for rate limiting
const rateLimitStore: RateLimitStore = {}

const MAX_REQUESTS_PER_24H = 5
const WINDOW_SIZE_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Rate limiting middleware for AI requests
 * Enforces 5 requests per 24 hours per authenticated user
 */
export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get user ID from Clerk authentication
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth?.userId

    // Skip rate limiting for unauthenticated users
    // (they will be blocked by auth middleware)
    if (!userId) {
      next()
      return
    }

    const now = Date.now()
    const userLimit = rateLimitStore[userId]

    // First request from this user
    if (!userLimit) {
      rateLimitStore[userId] = {
        count: 1,
        firstRequestTime: now,
      }
      next()
      return
    }

    // Check if 24-hour window has passed
    const timeSinceFirstRequest = now - userLimit.firstRequestTime
    
    if (timeSinceFirstRequest > WINDOW_SIZE_MS) {
      // Reset the window
      rateLimitStore[userId] = {
        count: 1,
        firstRequestTime: now,
      }
      next()
      return
    }

    // User is within the 24-hour window
    if (userLimit.count >= MAX_REQUESTS_PER_24H) {
      // Limit reached
      const resetTime = new Date(userLimit.firstRequestTime + WINDOW_SIZE_MS)
      res.status(429).json({
        success: false,
        message: 'Daily AI request limit reached. Try again after 24 hours.',
        error: 'RATE_LIMIT_EXCEEDED',
        resetTime: resetTime.toISOString(),
        remaining: 0,
      })
      return
    }

    // Increment request count and allow request
    userLimit.count++
    const remaining = MAX_REQUESTS_PER_24H - userLimit.count
    
    // Store remaining count in response headers
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', new Date(userLimit.firstRequestTime + WINDOW_SIZE_MS).toISOString())
    
    next()
  } catch (error) {
    console.error('[RateLimit] Error in rate limiting middleware:', error)
    // Allow request if middleware fails
    next()
  }
}

/**
 * Get rate limit status for a user (for diagnostic purposes)
 */
export const getRateLimitStatus = (userId: string) => {
  const userLimit = rateLimitStore[userId]
  
  if (!userLimit) {
    return {
      count: 0,
      remaining: MAX_REQUESTS_PER_24H,
      resetTime: new Date(Date.now() + WINDOW_SIZE_MS).toISOString(),
    }
  }

  const now = Date.now()
  const timeSinceFirstRequest = now - userLimit.firstRequestTime
  
  if (timeSinceFirstRequest > WINDOW_SIZE_MS) {
    return {
      count: 0,
      remaining: MAX_REQUESTS_PER_24H,
      resetTime: new Date(now + WINDOW_SIZE_MS).toISOString(),
    }
  }

  return {
    count: userLimit.count,
    remaining: Math.max(0, MAX_REQUESTS_PER_24H - userLimit.count),
    resetTime: new Date(userLimit.firstRequestTime + WINDOW_SIZE_MS).toISOString(),
  }
}
