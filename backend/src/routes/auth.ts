/**
 * Authentication Routes
 *
 * Handles user registration, login, and session management.
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, generateToken, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /auth/register
 * Create a new user account
 */
router.post(
  '/register',
  registerValidation,
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { email, password, age } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with related records
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        age,
        stats: {
          create: {
            findLimit: config.game.defaultFindLimit,
          },
        },
        wallet: {
          create: {
            totalBalance: 0,
            gasTank: 0,
            parked: 0,
            pending: 0,
          },
        },
      },
      include: {
        stats: true,
        wallet: true,
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          age: user.age,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  })
);

/**
 * POST /auth/login
 * Login with email and password
 */
router.post(
  '/login',
  loginValidation,
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if banned
    if (user.isBanned) {
      throw new ApiError(403, `Account suspended: ${user.banReason || 'Contact support'}`);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          age: user.age,
          createdAt: user.createdAt,
          stats: user.stats,
          wallet: {
            totalBalance: user.wallet?.totalBalance || 0,
            gasTank: user.wallet?.gasTank || 0,
            parked: user.wallet?.parked || 0,
            pending: user.wallet?.pending || 0,
          },
        },
        token,
      },
    });
  })
);

/**
 * POST /auth/google
 * Login with Google OAuth token
 */
router.post(
  '/google',
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError(400, 'Google ID token is required');
    }

    // TODO: Verify Google token with Google's API
    // For now, return a placeholder response
    throw new ApiError(501, 'Google authentication not yet implemented');
  })
);

/**
 * POST /auth/logout
 * Invalidate session (client-side token removal)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    // JWT is stateless, so logout is handled client-side
    // In production, you might want to blacklist tokens

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        age: user.age,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        stats: user.stats,
        wallet: {
          totalBalance: user.wallet?.totalBalance || 0,
          gasTank: user.wallet?.gasTank || 0,
          parked: user.wallet?.parked || 0,
          pending: user.wallet?.pending || 0,
        },
      },
    });
  })
);

export default router;

