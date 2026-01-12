/**
 * Wallet Controller
 * Handles wallet and economy endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// ═══════════════════════════════════════════════════════════════════════════
// GET WALLET BALANCE
// ═══════════════════════════════════════════════════════════════════════════

export const getWalletBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      res.status(404).json({ success: false, message: 'Wallet not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        total: wallet.totalBalance.toNumber(),
        gas_tank: wallet.gasTank.toNumber(),
        parked: wallet.parked.toNumber(),
        pending: wallet.pending.toNumber(),
        lastGasCharge: wallet.lastGasCharge,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GET TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getWalletTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
      skip: parseInt(offset as string, 10),
      include: {
        coin: { select: { id: true, type: true, value: true } },
      },
    });

    const total = await prisma.transaction.count({ where: { userId } });

    res.json({
      success: true,
      data: {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          type: tx.type.toLowerCase(),
          amount: tx.amount.toNumber(),
          timestamp: tx.createdAt.toISOString(),
          coin_id: tx.coinId,
          status: tx.status.toLowerCase(),
          description: tx.description,
        })),
        pagination: {
          total,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PARK COINS
// ═══════════════════════════════════════════════════════════════════════════

export const parkCoins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.gasTank.toNumber() < amount) {
      res.status(400).json({ success: false, message: 'Insufficient balance in gas tank' });
      return;
    }

    // Move from gas tank to parked
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        gasTank: { decrement: amount },
        parked: { increment: amount },
      },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'PARKED',
        amount: -amount,
        status: 'CONFIRMED',
        description: `Parked $${amount.toFixed(2)} BBG`,
      },
    });

    res.json({
      success: true,
      message: `Parked $${amount.toFixed(2)} BBG successfully`,
      data: {
        gas_tank: updatedWallet.gasTank.toNumber(),
        parked: updatedWallet.parked.toNumber(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UNPARK COINS
// ═══════════════════════════════════════════════════════════════════════════

export const unparkCoins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.parked.toNumber() < amount) {
      res.status(400).json({ success: false, message: 'Insufficient parked balance' });
      return;
    }

    // Deduct 1 day's gas immediately upon unparking
    const dailyGasRate = 0.33;
    const amountAfterGas = amount - dailyGasRate;

    // Move from parked to gas tank (minus 1 day fee)
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: {
        parked: { decrement: amount },
        gasTank: { increment: amountAfterGas },
        totalBalance: { decrement: dailyGasRate },
      },
    });

    // Create transactions
    await prisma.transaction.create({
      data: {
        userId,
        type: 'UNPARKED',
        amount: amount,
        status: 'CONFIRMED',
        description: `Unparked $${amount.toFixed(2)} BBG`,
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'GAS_CONSUMED',
        amount: -dailyGasRate,
        status: 'CONFIRMED',
        description: 'Gas fee for unparking',
      },
    });

    res.json({
      success: true,
      message: `Unparked $${amount.toFixed(2)} BBG (after $${dailyGasRate.toFixed(2)} gas fee)`,
      data: {
        gas_tank: updatedWallet.gasTank.toNumber(),
        parked: updatedWallet.parked.toNumber(),
        gasFeeCharged: dailyGasRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

