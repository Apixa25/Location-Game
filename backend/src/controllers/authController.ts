/**
 * Auth Controller
 * Handles user authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import config from '../config';

// ═══════════════════════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════════════════════

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, age } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already in use' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with related records
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        age: age || null,
        stats: {
          create: {
            findLimit: 1.0,
          },
        },
        wallet: {
          create: {
            totalBalance: 10.0, // $10 starter balance
            gasTank: 10.0,
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

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

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
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { stats: true, wallet: true },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check if banned
    if (user.isBanned) {
      res.status(403).json({ success: false, message: 'Account is banned', reason: user.banReason });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          age: user.age,
          createdAt: user.createdAt,
          stats: user.stats,
          wallet: user.wallet,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE LOGIN (Placeholder)
// ═══════════════════════════════════════════════════════════════════════════

export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement Google OAuth verification
    res.status(501).json({
      success: false,
      message: 'Google OAuth not yet implemented',
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════════════════

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a stateless JWT setup, logout is handled client-side by deleting the token
    // For enhanced security, you could implement a token blacklist here
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GET CURRENT USER
// ═══════════════════════════════════════════════════════════════════════════

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { stats: true, wallet: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        age: user.age,
        createdAt: user.createdAt,
        stats: user.stats,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    next(error);
  }
};

