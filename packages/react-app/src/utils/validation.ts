import { z } from 'zod'
import { ethers } from 'ethers'

// Ethereum address validation
export const ethereumAddressSchema = z.string().refine(
  (address) => {
    try {
      return ethers.utils.isAddress(address)
    } catch {
      return false
    }
  },
  { message: 'Invalid Ethereum address' }
)

// Stream configuration validation
export const streamConfigSchema = z.object({
  recipient: ethereumAddressSchema,
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Amount must be a positive number'),
  tokenAddress: ethereumAddressSchema,
  startTime: z.date().min(new Date(), 'Start time must be in the future'),
  stopTime: z.date(),
  description: z.string().max(500, 'Description too long').optional()
}).refine(
  (data) => data.stopTime > data.startTime,
  {
    message: 'Stop time must be after start time',
    path: ['stopTime']
  }
)

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  skills: z.array(z.string()).max(10, 'Too many skills').optional(),
  hourlyRate: z.number().min(0, 'Rate must be positive').optional(),
  email: z.string().email('Invalid email').optional()
})

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long')
    .refine((msg) => msg.trim().length > 0, 'Message cannot be only whitespace'),
  recipient: ethereumAddressSchema
})

// Peer signup validation
export const peerSignupSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description too long'),
  skills: z.array(z.string()).min(1, 'At least one skill required').max(5, 'Too many skills'),
  hourlyRate: z.number().min(1, 'Hourly rate must be at least $1').max(1000, 'Hourly rate too high')
})

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs)
    
    if (validAttempts.length >= maxAttempts) {
      return false
    }
    
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

export const rateLimiter = new RateLimiter()

// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleAsyncError = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Async operation failed:', error)
      throw error instanceof AppError ? error : new AppError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        500
      )
    }
  }
}