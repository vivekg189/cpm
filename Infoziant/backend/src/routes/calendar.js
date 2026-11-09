// src/routes/calendar.js — Smart expiry & service calendar events
'use strict';

const express = require('express');
const Document = require('../models/Document');
const Maintenance = require('../models/Maintenance');

const router = express.Router();

/**
 * GET /api/calendar/events
 * Merges document expirations and scheduled maintenance into a unified timeline.
 */
router.get('/events', async (req, res, next) => {
  try {
    const { vehicleId, year, month, startDate, endDate, eventType } = req.query;
    const events = [];
    const now = new Date();

    let start = null;
    let end = null;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 0, 23, 59, 59);
    }

    // 1. Fetch Document Expirations
    if (!eventType || eventType === 'ALL' || eventType === 'document_expiry') {
      const docFilter = { expiryDate: { $ne: null } };
      if (vehicleId) docFilter.vehicle = vehicleId;
      if (start && end) {
        docFilter.expiryDate = { $gte: start, $lte: end };
      }

      const docs = await Document.find(docFilter)
        .populate('vehicle', 'registrationNumber make model')
        .lean();

      docs.forEach((doc) => {
        const exp = new Date(doc.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let urgency = 'info';
        if (exp < now) urgency = 'critical';
        else if (diffDays <= 7) urgency = 'critical';
        else if (diffDays <= 30) urgency = 'warning';

        events.push({
          id: `doc_${doc._id}`,
          title: `${doc.title} (${doc.vehicle?.registrationNumber || 'Vehicle'})`,
          date: exp.toISOString(),
          type: 'document_expiry',
          documentType: doc.documentType,
          urgency,
          daysRemaining: diffDays,
          vehicle: doc.vehicle,
          metadata: {
            documentId: doc._id,
            originalFilename: doc.originalFilename,
          },
        });
      });
    }

    // 2. Fetch Maintenance Due Events
    if (!eventType || eventType === 'ALL' || eventType === 'service_due') {
      const maintFilter = { 'nextServiceDue.date': { $ne: null } };
      if (vehicleId) maintFilter.vehicle = vehicleId;
      if (start && end) {
        maintFilter['nextServiceDue.date'] = { $gte: start, $lte: end };
      }

      const services = await Maintenance.find(maintFilter)
        .populate('vehicle', 'registrationNumber make model')
        .lean();

      services.forEach((m) => {
        const due = new Date(m.nextServiceDue.date);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        events.push({
          id: `maint_${m._id}`,
          title: `Service Due: ${m.serviceType} (${m.vehicle?.registrationNumber || 'Vehicle'})`,
          date: due.toISOString(),
          type: 'service_due',
          urgency: diffDays <= 7 ? 'warning' : 'info',
          daysRemaining: diffDays,
          vehicle: m.vehicle,
          metadata: {
            maintenanceId: m._id,
            serviceType: m.serviceType,
            workshop: m.performedBy,
          },
        });
      });
    }

    // Sort events chronologically
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      count: events.length,
      events,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

