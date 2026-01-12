/**
 * Coin Routes
 *
 * Handles coin discovery, collection, and hiding.
 */

import { Router, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// All coin routes require authentication
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

const nearbyValidation = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius')
    .optional()
    .isInt({ min: 10, max: 5000 })
    .withMessage('Radius must be between 10 and 5000 meters'),
];

const hideValidation = [
  body('coinType').isIn(['fixed', 'pool']).withMessage('Coin type must be "fixed" or "pool"'),
  body('value')
    .isFloat({ min: 0.05, max: 100 })
    .withMessage('Value must be between $0.05 and $100'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
];

const collectValidation = [
  param('id').isUUID().withMessage('Valid coin ID required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /coins/nearby
 * Get coins near a location
 */
router.get(
  '/nearby',
  nearbyValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 500; // Default 500m

    // Get user's find limit
    const userStats = await prisma.userStats.findUnique({
      where: { userId: req.user!.id },
    });
    const findLimit = userStats?.findLimit || config.game.defaultFindLimit;

    // Query coins within radius using raw SQL for PostGIS
    // Note: This requires PostGIS extension and proper column setup
    // For now, we'll use a simpler bounding box approach
    const latDelta = radius / 111000; // Approximate degrees per meter
    const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180));

    const coins = await prisma.coin.findMany({
      where: {
        status: 'visible',
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
      select: {
        id: true,
        coinType: true,
        value: true,
        latitude: true,
        longitude: true,
        hiddenAt: true,
        multiFindEnabled: true,
        findsRemaining: true,
        currentTier: true,
      },
    });

    // Filter by actual distance and add metadata
    const nearbyCoins = coins
      .map((coin) => {
        const distance = calculateDistance(lat, lng, coin.latitude, coin.longitude);
        const isLocked = coin.coinType === 'fixed' && coin.value !== null && coin.value > findLimit;

        return {
          id: coin.id,
          coinType: coin.coinType,
          value: isLocked ? null : coin.value, // Hide value if locked
          latitude: coin.latitude,
          longitude: coin.longitude,
          distance: Math.round(distance),
          isLocked,
          isMultiFind: coin.multiFindEnabled,
          currentTier: coin.currentTier,
        };
      })
      .filter((coin) => coin.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        coins: nearbyCoins,
        count: nearbyCoins.length,
        center: { lat, lng },
        radius,
        findLimit,
      },
    });
  })
);

/**
 * GET /coins/:id
 * Get coin details
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const coin = await prisma.coin.findUnique({
      where: { id },
      include: {
        hider: {
          select: { id: true },
        },
      },
    });

    if (!coin) {
      throw new ApiError(404, 'Coin not found');
    }

    res.json({
      success: true,
      data: coin,
    });
  })
);

/**
 * POST /coins/hide
 * Hide a new coin
 */
router.post(
  '/hide',
  hideValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { coinType, value, latitude, longitude } = req.body;

    // Check user has sufficient balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.gasTank < value) {
      throw new ApiError(400, 'Insufficient funds in gas tank');
    }

    // Create coin and deduct from wallet in transaction
    const [coin] = await prisma.$transaction([
      prisma.coin.create({
        data: {
          coinType,
          value: coinType === 'fixed' ? value : null,
          contribution: value,
          latitude,
          longitude,
          hiderId: userId,
          status: 'visible',
          huntType: 'direct_navigation',
        },
      }),
      prisma.wallet.update({
        where: { userId },
        data: {
          gasTank: { decrement: value },
          totalBalance: { decrement: value },
        },
      }),
      prisma.userStats.update({
        where: { userId },
        data: {
          totalHiddenCount: { increment: 1 },
          totalHiddenValue: { increment: value },
          highestHiddenValue: {
            set: Math.max(value, wallet.gasTank), // Will be updated properly
          },
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'hidden',
          amount: -value,
          coinId: undefined, // Will be linked after
          status: 'confirmed',
          description: `Hid a ${coinType} coin`,
        },
      }),
    ]);

    // Update find limit if this is their highest contribution
    const stats = await prisma.userStats.findUnique({ where: { userId } });
    if (stats && value > stats.highestHiddenValue) {
      await prisma.userStats.update({
        where: { userId },
        data: {
          highestHiddenValue: value,
          findLimit: value,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        coin: {
          id: coin.id,
          coinType: coin.coinType,
          value: coin.value,
          contribution: coin.contribution,
          latitude: coin.latitude,
          longitude: coin.longitude,
        },
        newFindLimit: Math.max(stats?.findLimit || config.game.defaultFindLimit, value),
      },
    });
  })
);

/**
 * POST /coins/:id/collect
 * Collect a coin
 */
router.post(
  '/:id/collect',
  collectValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    // Get coin
    const coin = await prisma.coin.findUnique({
      where: { id },
    });

    if (!coin) {
      throw new ApiError(404, 'Coin not found');
    }

    if (coin.status !== 'visible') {
      throw new ApiError(400, 'Coin has already been collected');
    }

    // Check distance
    const distance = calculateDistance(latitude, longitude, coin.latitude, coin.longitude);
    if (distance > config.game.collectionRangeMeters) {
      throw new ApiError(400, `Too far from coin (${Math.round(distance)}m away)`);
    }

    // Check find limit
    const userStats = await prisma.userStats.findUnique({ where: { userId } });
    const findLimit = userStats?.findLimit || config.game.defaultFindLimit;

    if (coin.coinType === 'fixed' && coin.value !== null && coin.value > findLimit) {
      throw new ApiError(400, 'This coin exceeds your find limit');
    }

    // Check gas
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.gasTank <= 0) {
      throw new ApiError(400, 'No gas remaining');
    }

    // Calculate value for pool coins
    let valueReceived = coin.value || 0;
    if (coin.coinType === 'pool') {
      // Dynamic slot machine logic
      valueReceived = Math.max(0.05, Math.random() * (coin.contribution || 1) * 2);
      valueReceived = Math.round(valueReceived * 100) / 100;
    }

    // Collect coin in transaction
    await prisma.$transaction([
      // Update coin status
      prisma.coin.update({
        where: { id },
        data: {
          status: 'collected',
        },
      }),
      // Create coin find record
      prisma.coinFind.create({
        data: {
          coinId: id,
          finderId: userId,
          valueReceived,
          tier: 'gold',
          status: 'pending',
        },
      }),
      // Add to pending balance
      prisma.wallet.update({
        where: { userId },
        data: {
          pending: { increment: valueReceived },
          totalBalance: { increment: valueReceived },
        },
      }),
      // Update stats
      prisma.userStats.update({
        where: { userId },
        data: {
          totalFoundCount: { increment: 1 },
          totalFoundValue: { increment: valueReceived },
        },
      }),
      // Record transaction
      prisma.transaction.create({
        data: {
          userId,
          type: 'found',
          amount: valueReceived,
          coinId: id,
          status: 'pending',
          description: `Found a ${coin.coinType} coin`,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        coinId: id,
        valueReceived,
        coinType: coin.coinType,
        message:
          valueReceived >= 10
            ? "Blimey! A legendary haul, matey!"
            : valueReceived >= 1
            ? "A fine piece o' eight!"
            : "Every coin fills the chest!",
      },
    });
  })
);

/**
 * DELETE /coins/:id
 * Retrieve your own unfound coin
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const coin = await prisma.coin.findUnique({
      where: { id },
    });

    if (!coin) {
      throw new ApiError(404, 'Coin not found');
    }

    if (coin.hiderId !== userId) {
      throw new ApiError(403, 'You can only retrieve your own coins');
    }

    if (coin.status !== 'visible') {
      throw new ApiError(400, 'Coin has already been collected');
    }

    // Return coin value to user in transaction
    await prisma.$transaction([
      prisma.coin.delete({
        where: { id },
      }),
      prisma.wallet.update({
        where: { userId },
        data: {
          gasTank: { increment: coin.contribution },
          totalBalance: { increment: coin.contribution },
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'refund',
          amount: coin.contribution,
          status: 'confirmed',
          description: 'Retrieved unfound coin',
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Coin retrieved successfully',
      data: {
        refundedAmount: coin.contribution,
      },
    });
  })
);

export default router;

