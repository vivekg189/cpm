// src/routes/maintenance.js — vehicle maintenance & service log API
'use strict';

const express = require('express');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const validateObjectId = require('../middleware/validateObjectId');
const { createError } = require('../middleware/errorHandler');
const { logActivity } = require('../services/activityService');

const router = express.Router();

// GET /api/maintenance — list all maintenance records with optional vehicle filter
router.get('/', async (req, res, next) => {
  try {
    const { vehicleId, status } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicle = vehicleId;
    if (status) filter.status = status;

    const records = await Maintenance.find(filter)
      .populate('vehicle', 'registrationNumber make model year')
      .sort({ serviceDate: -1 })
      .lean();

    res.json({ count: records.length, records });
  } catch (err) {
    next(err);
  }
});

// POST /api/maintenance — log new maintenance service
router.post('/', async (req, res, next) => {
  try {
    const {
      vehicleId,
      serviceType,
      serviceDate,
      odometerReading,
      cost,
      performedBy,
      invoiceNumber,
      nextServiceDue,
      status,
      notes,
    } = req.body;

    if (!vehicleId || !serviceType || cost === undefined || !performedBy) {
      return next(createError(400, 'vehicleId, serviceType, cost, and performedBy are required'));
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return next(createError(404, 'Vehicle not found'));

    const record = new Maintenance({
      vehicle: vehicle._id,
      serviceType,
      serviceDate: serviceDate || new Date(),
      odometerReading: Number(odometerReading) || 0,
      cost: Number(cost) || 0,
      performedBy,
      invoiceNumber: invoiceNumber || '',
      nextServiceDue: nextServiceDue || {},
      status: status || 'completed',
      notes: notes || '',
    });

    await record.save();
    await record.populate('vehicle', 'registrationNumber make model year');

    // Audit log
    await logActivity(
      'MAINTENANCE_CREATED',
      'Maintenance',
      record._id,
      `${serviceType} (${vehicle.registrationNumber})`,
      `Service recorded at ${performedBy} for Rs. ${cost}`,
      { cost, odometer: odometerReading },
      req
    );

    res.status(201).json({ message: 'Maintenance record created', record });
  } catch (err) {
    next(err);
  }
});

// GET /api/maintenance/:id — get one record
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id)
      .populate('vehicle', 'registrationNumber make model year')
      .lean();
    if (!record) return next(createError(404, 'Maintenance record not found'));
    res.json({ record });
  } catch (err) {
    next(err);
  }
});

// PUT /api/maintenance/:id — update a maintenance record
router.put('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const update = { ...req.body };
    delete update._id;

    const record = await Maintenance.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate('vehicle', 'registrationNumber make model year');

    if (!record) return next(createError(404, 'Maintenance record not found'));

    await logActivity(
      'MAINTENANCE_UPDATED',
      'Maintenance',
      record._id,
      record.serviceType,
      `Updated service record details`,
      {},
      req
    );

    res.json({ message: 'Maintenance record updated', record });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/maintenance/:id — delete a maintenance record
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const record = await Maintenance.findByIdAndDelete(req.params.id);
    if (!record) return next(createError(404, 'Maintenance record not found'));

    await logActivity(
      'MAINTENANCE_DELETED',
      'Maintenance',
      record._id,
      record.serviceType,
      `Deleted maintenance record`,
      {},
      req
    );

    res.json({ message: 'Maintenance record deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

