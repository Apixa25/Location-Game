/**
 * Error Handling Middleware
 *
 * Provides consistent error responses across the API.
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export const Errors = {
  // Authentication
  UNAUTHORIZED: new ApiError(401, 'Authentication required'),
  INVALID_CREDENTIALS: new ApiError(401, 'Invalid email or password'),
  TOKEN_EXPIRED: new ApiError(401, 'Token has expired'),
  INVALID_TOKEN: new ApiError(401, 'Invalid token'),

  // Authorization
  FORBIDDEN: new ApiError(403, 'You do not have permission to perform this action'),

  // Not found
  NOT_FOUND: new ApiError(404, 'Resource not found'),
  USER_NOT_FOUND: new ApiError(404, 'User not found'),
  COIN_NOT_FOUND: new ApiError(404, 'Coin not found'),

  // Validation
  VALIDATION_ERROR: new ApiError(400, 'Validation error'),
  INVALID_INPUT: new ApiError(400, 'Invalid input data'),

  // Business logic
  INSUFFICIENT_FUNDS: new ApiError(400, 'Insufficient funds'),
  FIND_LIMIT_EXCEEDED: new ApiError(400, 'This coin exceeds your find limit'),
  NO_GAS: new ApiError(400, 'No gas remaining'),
  OUT_OF_RANGE: new ApiError(400, 'Coin is out of collection range'),
  ALREADY_COLLECTED: new ApiError(400, 'Coin has already been collected'),

  // Server
  INTERNAL_ERROR: new ApiError(500, 'Internal server error', false),
  DATABASE_ERROR: new ApiError(500, 'Database error', false),
};

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.path}`);
  next(error);
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 if no status code
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  // Build error response
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
    },
  };

  // Include stack trace in development
  if (config.isDevelopment) {
    response.error.stack = err.stack;
  }

  // Log error
  if (statusCode >= 500) {
    console.error('❌ Server Error:', {
      message: err.message,
      stack: err.stack,
    });
  } else if (config.isDevelopment) {
    console.warn(`⚠️ Client Error (${statusCode}):`, message);
  }

  res.status(statusCode).json(response);
}

/**
 * Async handler wrapper - catches errors from async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default { ApiError, Errors, errorHandler, notFoundHandler, asyncHandler };

