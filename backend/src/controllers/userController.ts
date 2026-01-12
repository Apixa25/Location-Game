/**
 * User Controller
 * Handles user profile and settings endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// ═══════════════════════════════════════════════════════════════════════════
// GET USER STATS
// ═══════════════════════════════════════════════════════════════════════════

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const stats = await prisma.userStats.findUnique({ where: { userId } });

    if (!stats) {
      res.status(404).json({ success: false, message: 'User stats not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        findLimit: stats.findLimit.toNumber(),
        totalFoundCount: stats.totalFoundCount,
        totalFoundValue: stats.totalFoundValue.toNumber(),
        totalHiddenCount: stats.totalHiddenCount,
        totalHiddenValue: stats.totalHiddenValue.toNumber(),
        highestHiddenValue: stats.highestHiddenValue.toNumber(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE USER SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export const updateUserSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { age } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        age: age !== undefined ? age : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        age: updatedUser.age,
      },
    });
  } catch (error) {
    next(error);
  }
};

