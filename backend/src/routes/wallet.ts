/**
 * Wallet Routes
 *
 * Handles balance, transactions, parking, and gas management.
 */

import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

const amountValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be at least $0.01'),
];

const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
];

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /wallet
 * Get wallet balance breakdown
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    // Calculate days of gas remaining
    const daysRemaining = Math.floor(wallet.gasTank / config.game.dailyGasRate);
    const isLowGas = daysRemaining < 5 && daysRemaining > 0;
    const isEmpty = wallet.gasTank <= 0;

    res.json({
      success: true,
      data: {
        totalBalance: wallet.totalBalance,
        gasTank: wallet.gasTank,
        parked: wallet.parked,
        pending: wallet.pending,
        gasStatus: {
          daysRemaining,
          isLowGas,
          isEmpty,
          dailyRate: config.game.dailyGasRate,
        },
        lastGasCharge: wallet.lastGasCharge,
      },
    });
  })
);

/**
 * GET /wallet/transactions
 * Get transaction history
 */
router.get(
  '/transactions',
  paginationValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          coin: {
            select: {
              id: true,
              coinType: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + transactions.length < total,
        },
      },
    });
  })
);

/**
 * POST /wallet/park
 * Park coins (protect from gas consumption)
 */
router.post(
  '/park',
  amountValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { amount } = req.body;

    // Get current wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    if (amount > wallet.gasTank) {
      throw new ApiError(400, `Insufficient funds. Only $${wallet.gasTank.toFixed(2)} available in gas tank.`);
    }

    // Park coins in transaction
    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          gasTank: { decrement: amount },
          parked: { increment: amount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'parked',
          amount: -amount,
          status: 'confirmed',
          description: `Parked $${amount.toFixed(2)} (protected from gas)`,
        },
      }),
    ]);

    res.json({
      success: true,
      message: `Successfully parked $${amount.toFixed(2)}`,
      data: {
        gasTank: updatedWallet.gasTank,
        parked: updatedWallet.parked,
        totalBalance: updatedWallet.totalBalance,
      },
    });
  })
);

/**
 * POST /wallet/unpark
 * Unpark coins (move back to gas tank, with fee)
 */
router.post(
  '/unpark',
  amountValidation,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { amount } = req.body;

    // Get current wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    if (amount > wallet.parked) {
      throw new ApiError(400, `Insufficient parked funds. Only $${wallet.parked.toFixed(2)} parked.`);
    }

    // Calculate fee (1 day's gas)
    const fee = config.game.dailyGasRate;
    const netAmount = Math.max(0, amount - fee);

    // Unpark coins in transaction
    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          parked: { decrement: amount },
          gasTank: { increment: netAmount },
          totalBalance: { decrement: fee },
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'unparked',
          amount: amount,
          status: 'confirmed',
          description: `Unparked $${amount.toFixed(2)} to gas tank`,
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'gas_consumed',
          amount: -fee,
          status: 'confirmed',
          description: `Unpark fee: $${fee.toFixed(2)}`,
        },
      }),
    ]);

    res.json({
      success: true,
      message: `Unparked $${amount.toFixed(2)} (minus $${fee.toFixed(2)} fee)`,
      data: {
        gasTank: updatedWallet.gasTank,
        parked: updatedWallet.parked,
        totalBalance: updatedWallet.totalBalance,
        feeCharged: fee,
        netAmount,
      },
    });
  })
);

/**
 * POST /wallet/consume-gas
 * Consume daily gas (called by scheduled job or on app launch)
 */
router.post(
  '/consume-gas',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    // Check if already consumed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (wallet.lastGasCharge && wallet.lastGasCharge >= today) {
      return res.json({
        success: true,
        message: 'Gas already consumed today',
        data: {
          gasTank: wallet.gasTank,
          alreadyCharged: true,
        },
      });
    }

    // Calculate gas to consume
    const gasToConsume = Math.min(config.game.dailyGasRate, wallet.gasTank);

    if (gasToConsume <= 0) {
      return res.json({
        success: true,
        message: 'No gas to consume',
        data: {
          gasTank: 0,
          isEmpty: true,
        },
      });
    }

    // Consume gas in transaction
    const [updatedWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          gasTank: { decrement: gasToConsume },
          totalBalance: { decrement: gasToConsume },
          lastGasCharge: new Date(),
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'gas_consumed',
          amount: -gasToConsume,
          status: 'confirmed',
          description: `Daily gas fee: $${gasToConsume.toFixed(2)}`,
        },
      }),
    ]);

    res.json({
      success: true,
      message: `Consumed $${gasToConsume.toFixed(2)} gas`,
      data: {
        gasTank: updatedWallet.gasTank,
        gasConsumed: gasToConsume,
        daysRemaining: Math.floor(updatedWallet.gasTank / config.game.dailyGasRate),
      },
    });
  })
);

/**
 * POST /wallet/confirm-pending
 * Confirm pending coins older than 24 hours
 */
router.post(
  '/confirm-pending',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    // Find pending transactions older than confirmation period
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - config.game.pendingConfirmationHours);

    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'pending',
        createdAt: { lt: cutoffTime },
      },
    });

    if (pendingTransactions.length === 0) {
      return res.json({
        success: true,
        message: 'No pending transactions to confirm',
        data: { confirmedCount: 0 },
      });
    }

    // Calculate total to move from pending to gas tank
    const totalToConfirm = pendingTransactions.reduce(
      (sum, tx) => sum + Math.max(0, tx.amount),
      0
    );

    // Confirm in transaction
    await prisma.$transaction([
      // Update transaction statuses
      prisma.transaction.updateMany({
        where: {
          id: { in: pendingTransactions.map((tx) => tx.id) },
        },
        data: { status: 'confirmed' },
      }),
      // Move from pending to gas tank
      prisma.wallet.update({
        where: { userId },
        data: {
          pending: { decrement: totalToConfirm },
          gasTank: { increment: totalToConfirm },
        },
      }),
      // Update coin finds
      prisma.coinFind.updateMany({
        where: {
          finderId: userId,
          status: 'pending',
          foundAt: { lt: cutoffTime },
        },
        data: { status: 'confirmed' },
      }),
    ]);

    res.json({
      success: true,
      message: `Confirmed ${pendingTransactions.length} transactions`,
      data: {
        confirmedCount: pendingTransactions.length,
        totalConfirmed: totalToConfirm,
      },
    });
  })
);

export default router;

