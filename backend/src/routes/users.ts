/**
 * User Routes
 *
 * Handles user profile, stats, and settings.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

const settingsValidation = [
  body('hapticEnabled').optional().isBoolean(),
  body('soundEnabled').optional().isBoolean(),
  body('notificationsEnabled').optional().isBoolean(),
];

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /users/stats
 * Get user statistics
 */
router.get(
  '/stats',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      throw new ApiError(404, 'User stats not found');
    }

    // Calculate tier based on find limit
    const tier = getTierForLimit(stats.findLimit);

    res.json({
      success: true,
      data: {
        findLimit: stats.findLimit,
        tier,
        totalFoundCount: stats.totalFoundCount,
        totalFoundValue: stats.totalFoundValue,
        totalHiddenCount: stats.totalHiddenCount,
        totalHiddenValue: stats.totalHiddenValue,
        highestHiddenValue: stats.highestHiddenValue,
      },
    });
  })
);

/**
 * GET /users/settings
 * Get user settings
 */
router.get(
  '/settings',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hapticEnabled: true,
        soundEnabled: true,
        notificationsEnabled: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

/**
 * PUT /users/settings
 * Update user settings
 */
router.put(
  '/settings',
  settingsValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { hapticEnabled, soundEnabled, notificationsEnabled } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(hapticEnabled !== undefined && { hapticEnabled }),
        ...(soundEnabled !== undefined && { soundEnabled }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      },
      select: {
        hapticEnabled: true,
        soundEnabled: true,
        notificationsEnabled: true,
      },
    });

    res.json({
      success: true,
      message: 'Settings updated',
      data: updatedUser,
    });
  })
);

/**
 * GET /users/leaderboard
 * Get top users by coins found
 */
router.get(
  '/leaderboard',
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const topUsers = await prisma.userStats.findMany({
      orderBy: { totalFoundValue: 'desc' },
      take: 50,
      select: {
        userId: true,
        totalFoundCount: true,
        totalFoundValue: true,
        findLimit: true,
        user: {
          select: {
            // Only include non-sensitive info
            createdAt: true,
          },
        },
      },
    });

    // Add rank and tier
    const leaderboard = topUsers.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId.substring(0, 8) + '...', // Anonymize
      totalFoundCount: entry.totalFoundCount,
      totalFoundValue: entry.totalFoundValue,
      tier: getTierForLimit(entry.findLimit),
      memberSince: entry.user.createdAt,
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        updatedAt: new Date().toISOString(),
      },
    });
  })
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get tier info based on find limit
 */
function getTierForLimit(limit: number): {
  name: string;
  icon: string;
  color: string;
} {
  if (limit >= 100) {
    return { name: 'Pirate Legend', icon: '👑', color: '#8A2BE2' };
  } else if (limit >= 25) {
    return { name: 'Captain', icon: '⚔️', color: '#FFD700' };
  } else if (limit >= 5) {
    return { name: 'Treasure Hunter', icon: '🗺️', color: '#C0C0C0' };
  } else if (limit >= 1) {
    return { name: 'Deck Hand', icon: '⚓', color: '#CD7F32' };
  } else {
    return { name: 'Cabin Boy', icon: '🪶', color: '#8B9DC3' };
  }
}

export default router;

