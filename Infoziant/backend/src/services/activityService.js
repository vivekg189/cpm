// src/services/activityService.js — helper for logging system operations
'use strict';

const ActivityLog = require('../models/ActivityLog');

/**
 * Log an audit action to MongoDB.
 * Failures to log are captured to console and never disrupt the main request.
 */
async function logActivity(action, entityType, entityId, entityName, details = '', metadata = {}, req = null) {
  try {
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      entityName,
      details,
      metadata,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to record activity:', err.message);
  }
}

module.exports = {
  logActivity,
};

