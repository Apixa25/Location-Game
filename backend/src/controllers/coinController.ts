/**
 * Coin Controller
 * Handles coin-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { coinService } from '../services/coinService';

// ═══════════════════════════════════════════════════════════════════════════
// GET NEARBY COINS
// ═══════════════════════════════════════════════════════════════════════════

export const getNearbyCoins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius = 500 } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusMeters = parseInt(radius as string, 10);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude',
      });
      return;
    }

    // Get coins near location
    const coins = await coinService.getCoinsNearLocation(latitude, longitude, radiusMeters);

    // Also ensure the grid has coins (auto-seeding)
    const grid = await coinService.getGridForLocation(latitude, longitude);
    await coinService.ensureGridHasCoins(grid.id);

    res.json({
      success: true,
      data: {
        coins,
        grid: {
          id: grid.id,
          center: {
            latitude: grid.latitude,
            longitude: grid.longitude,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HIDE COIN
// ═══════════════════════════════════════════════════════════════════════════

export const hideCoin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { coinType, value, latitude, longitude, logoFrontUrl, logoBackUrl } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!coinType || !value || !latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'coinType, value, latitude, and longitude are required',
      });
      return;
    }

    // Check user has enough balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.gasTank.toNumber() < value) {
      res.status(400).json({
        success: false,
        message: 'Insufficient balance to hide this coin',
      });
      return;
    }

    // Create the coin
    const coin = await prisma.coin.create({
      data: {
        type: coinType.toUpperCase(),
        value: coinType === 'FIXED' ? value : null,
        contribution: value,
        location: `POINT(${longitude} ${latitude})`,
        hiderId: userId,
        logoFrontUrl,
        logoBackUrl,
        status: 'VISIBLE',
      },
    });

    // Deduct from wallet
    await prisma.wallet.update({
      where: { userId },
      data: {
        gasTank: { decrement: value },
        totalBalance: { decrement: value },
      },
    });

    // Update user stats (for find limit)
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalHiddenCount: { increment: 1 },
        totalHiddenValue: { increment: value },
        highestHiddenValue: {
          set: Math.max(value, 0), // Will be updated with actual logic
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'HIDDEN',
        amount: -value,
        coinId: coin.id,
        status: 'CONFIRMED',
        description: `Hid a $${value.toFixed(2)} ${coinType} coin`,
      },
    });

    res.status(201).json({
      success: true,
      data: { coin },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COLLECT COIN
// ═══════════════════════════════════════════════════════════════════════════

export const collectCoin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id: coinId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Find the coin
    const coin = await prisma.coin.findUnique({ where: { id: coinId } });
    if (!coin) {
      res.status(404).json({ success: false, message: 'Coin not found' });
      return;
    }

    if (coin.status !== 'VISIBLE') {
      res.status(400).json({ success: false, message: 'Coin is not available for collection' });
      return;
    }

    // Check if user already found this coin
    const existingFind = await prisma.coinFind.findUnique({
      where: { coinId_finderId: { coinId, finderId: userId } },
    });
    if (existingFind) {
      res.status(400).json({ success: false, message: 'You have already collected this coin' });
      return;
    }

    // Get user's find limit
    const userStats = await prisma.userStats.findUnique({ where: { userId } });
    const findLimit = userStats?.findLimit.toNumber() || 1.0;
    const coinValue = coin.value?.toNumber() || 0;

    if (coinValue > findLimit) {
      res.status(403).json({
        success: false,
        message: 'This coin is above your find limit',
        data: { coinValue, findLimit },
      });
      return;
    }

    // Record the find
    await prisma.coinFind.create({
      data: {
        coinId,
        finderId: userId,
        valueReceived: coinValue,
        status: 'PENDING', // Will be confirmed after 24h
      },
    });

    // Update coin status
    await prisma.coin.update({
      where: { id: coinId },
      data: { status: 'COLLECTED' },
    });

    // Add to pending balance
    await prisma.wallet.update({
      where: { userId },
      data: {
        pending: { increment: coinValue },
        totalBalance: { increment: coinValue },
      },
    });

    // Update user stats
    await prisma.userStats.update({
      where: { userId },
      data: {
        totalFoundCount: { increment: 1 },
        totalFoundValue: { increment: coinValue },
      },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'FOUND',
        amount: coinValue,
        coinId,
        status: 'PENDING',
        description: `Found a $${coinValue.toFixed(2)} coin`,
      },
    });

    res.json({
      success: true,
      data: {
        coinId,
        value: coinValue,
        message: 'Coin collected! Value will be confirmed in 24 hours.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GET COIN DETAILS
// ═══════════════════════════════════════════════════════════════════════════

export const getCoinDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const coin = await prisma.coin.findUnique({
      where: { id },
      include: {
        hider: { select: { id: true, email: true } },
        finds: { select: { finderId: true, foundAt: true } },
      },
    });

    if (!coin) {
      res.status(404).json({ success: false, message: 'Coin not found' });
      return;
    }

    res.json({
      success: true,
      data: coin,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// RETRIEVE COIN (for hider)
// ═══════════════════════════════════════════════════════════════════════════

export const retrieveCoin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id: coinId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const coin = await prisma.coin.findUnique({ where: { id: coinId } });

    if (!coin) {
      res.status(404).json({ success: false, message: 'Coin not found' });
      return;
    }

    if (coin.hiderId !== userId) {
      res.status(403).json({ success: false, message: 'You can only retrieve your own coins' });
      return;
    }

    if (coin.status !== 'VISIBLE') {
      res.status(400).json({ success: false, message: 'Coin cannot be retrieved (already collected or recycled)' });
      return;
    }

    // Return the value to the user's wallet
    const coinValue = coin.contribution.toNumber();
    await prisma.wallet.update({
      where: { userId },
      data: {
        gasTank: { increment: coinValue },
        totalBalance: { increment: coinValue },
      },
    });

    // Delete the coin
    await prisma.coin.delete({ where: { id: coinId } });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'REFUND',
        amount: coinValue,
        status: 'CONFIRMED',
        description: `Retrieved hidden coin ($${coinValue.toFixed(2)})`,
      },
    });

    res.json({
      success: true,
      message: 'Coin retrieved and value returned to your wallet',
      data: { valueReturned: coinValue },
    });
  } catch (error) {
    next(error);
  }
};

