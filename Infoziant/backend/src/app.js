// src/app.js — Express application factory
'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const vehiclesRouter = require('./routes/vehicles');
const documentsRouter = require('./routes/documents');
const dashboardRouter = require('./routes/dashboard');
const maintenanceRouter = require('./routes/maintenance');
const expensesRouter = require('./routes/expenses');
const calendarRouter = require('./routes/calendar');
const notificationsRouter = require('./routes/notifications');
const activityRouter = require('./routes/activity');

function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — open for local dev / reverse proxy
  app.use(
    cors({
      origin: config.isProduction ? false : '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
  );

  // Rate limiting — prevents brute-force and DoS
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests', message: 'Please try again later.' },
    })
  );

  // Body parsing — limit JSON body size
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging (skip in test environment)
  if (config.env !== 'test') {
    app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  }

  // Core API routes
  app.use('/api/health', healthRouter);
  app.use('/api/vehicles', vehiclesRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/dashboard', dashboardRouter);

  // Advanced feature routes
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/expenses', expensesRouter);
  app.use('/api/calendar', calendarRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/activity', activityRouter);

  // 404 handler for unmatched API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'API endpoint does not exist' });
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
