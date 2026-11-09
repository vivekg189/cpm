// src/routes/activity.js — audit history & activity log API
'use strict';

const express = require('express');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

// GET /api/activity — list recent activity events
router.get('/', async (req, res, next) => {
  try {
    const { entityType, action, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (entityType && entityType !== 'ALL') {
      filter.entityType = entityType;
    }
    if (action && action !== 'ALL') {
      filter.action = action;
    }

    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const currentPage = Math.max(1, parseInt(page, 10));
    const skip = (currentPage - 1) * pageSize;

    const [total, activities] = await Promise.all([
      ActivityLog.countDocuments(filter),
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    res.json({
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
      activities,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

