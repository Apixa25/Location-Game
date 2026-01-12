/**
 * Authentication Middleware
 *
 * Validates JWT tokens and attaches user to request.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from './errorHandler';
import { prisma } from '../utils/prisma';

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Extended Request with user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Extract token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify JWT token
 */
function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid token');
    }
    throw new ApiError(401, 'Authentication failed');
  }
}

/**
 * Authentication middleware - requires valid JWT
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token
    const token = extractToken(req);
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    // Verify token
    const payload = verifyToken(token);

    // Check if user still exists and isn't banned
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isBanned: true },
    });

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    if (user.isBanned) {
      throw new ApiError(403, 'Account has been suspended');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isBanned: true },
    });

    if (user && !user.isBanned) {
      req.user = {
        id: user.id,
        email: user.email,
      };
    }

    next();
  } catch {
    // Ignore auth errors for optional auth
    next();
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export default { authenticate, optionalAuth, generateToken };

