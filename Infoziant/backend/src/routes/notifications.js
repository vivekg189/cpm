// src/routes/notifications.js — reminder alerts & notifications API
'use strict';

const express = require('express');
const Notification = require('../models/Notification');
const { syncExpiryNotifications } = require('../services/notificationService');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// GET /api/notifications — list notifications (refreshed automatically)
router.get('/', async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;

    // Trigger sync check for fresh 30, 15, 7, 1-day reminders
    await syncExpiryNotifications();

    const filter = {};
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('vehicle', 'registrationNumber make model')
      .populate('document', 'title documentType')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', validateObjectId('id'), async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all — mark all as read
router.post('/read-all', async (_req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

