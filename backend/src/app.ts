/**
 * Express Application Setup
 *
 * Configures Express with all middleware, routes, and error handling.
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import coinRoutes from './routes/coins';
import walletRoutes from './routes/wallet';
import userRoutes from './routes/users';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // ─────────────────────────────────────────────────────────────────────────
  // SECURITY MIDDLEWARE
  // ─────────────────────────────────────────────────────────────────────────

  // Helmet - secure HTTP headers
  app.use(helmet());

  // CORS - Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // ─────────────────────────────────────────────────────────────────────────
  // PARSING MIDDLEWARE
  // ─────────────────────────────────────────────────────────────────────────

  // Parse JSON bodies
  app.use(express.json({ limit: '10kb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ─────────────────────────────────────────────────────────────────────────
  // LOGGING MIDDLEWARE
  // ─────────────────────────────────────────────────────────────────────────

  // HTTP request logging
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HEALTH CHECK
  // ─────────────────────────────────────────────────────────────────────────

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'black-barts-gold-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // API ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  // API version prefix
  const apiPrefix = '/api/v1';

  // Mount routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/coins`, coinRoutes);
  app.use(`${apiPrefix}/wallet`, walletRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);

  // ─────────────────────────────────────────────────────────────────────────
  // ERROR HANDLING
  // ─────────────────────────────────────────────────────────────────────────

  // 404 handler for unknown routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;

