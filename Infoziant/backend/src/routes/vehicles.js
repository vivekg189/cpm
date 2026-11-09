// src/routes/vehicles.js — full CRUD, fleet grouping, QR code access, and PDF report export
'use strict';

const express = require('express');
const QRCode = require('qrcode');
const Vehicle = require('../models/Vehicle');
const Document = require('../models/Document');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const validateObjectId = require('../middleware/validateObjectId');
const { createError } = require('../middleware/errorHandler');
const { logActivity } = require('../services/activityService');
const { generateVehicleReport } = require('../services/reportService');

const router = express.Router();

// GET /api/vehicles — list vehicles with optional fleetGroup or status filter
router.get('/', async (req, res, next) => {
  try {
    const { fleetGroup, status, search } = req.query;
    const filter = {};

    if (fleetGroup && fleetGroup !== 'ALL') {
      filter.fleetGroup = fleetGroup;
    }
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { registrationNumber: new RegExp(search, 'i') },
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { 'assignedDriver.name': new RegExp(search, 'i') },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ count: vehicles.length, vehicles });
  } catch (err) {
    next(err);
  }
});

// POST /api/vehicles — create a vehicle
router.post('/', async (req, res, next) => {
  try {
    const {
      registrationNumber,
      make,
      model,
      year,
      fleetGroup,
      status,
      fuelType,
      assignedDriver,
      notes,
    } = req.body;

    if (!registrationNumber || !make || !model || !year) {
      return next(createError(400, 'registrationNumber, make, model, and year are required'));
    }

    const vehicle = new Vehicle({
      registrationNumber,
      make,
      model,
      year,
      fleetGroup: fleetGroup || 'Personal',
      status: status || 'active',
      fuelType: fuelType || 'Petrol',
      assignedDriver: assignedDriver || {},
      notes: notes || '',
    });

    await vehicle.save();

    await logActivity(
      'VEHICLE_CREATED',
      'Vehicle',
      vehicle._id,
      `${vehicle.registrationNumber} (${vehicle.make} ${vehicle.model})`,
      `Vehicle registered under ${vehicle.fleetGroup} fleet`,
      { registrationNumber, make, model },
      req
    );

    res.status(201).json({ message: 'Vehicle created', vehicle });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/:id — get one vehicle
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) return next(createError(404, 'Vehicle not found'));
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/:id/qrcode — get QR code data URL for vehicle
router.get('/:id/qrcode', validateObjectId('id'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) return next(createError(404, 'Vehicle not found'));

    const qrPayload = JSON.stringify({
      portal: 'VehicleVault Enterprise',
      reg: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      fleet: vehicle.fleetGroup,
      driver: vehicle.assignedDriver?.name || 'Unassigned',
      verifyUrl: `https://vehiclevault.local/verify/${vehicle._id}`,
    });

    const dataUrl = await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });

    res.json({
      vehicleId: vehicle._id,
      registrationNumber: vehicle.registrationNumber,
      qrCodeDataUrl: dataUrl,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/vehicles/:id/report — stream executive PDF report
router.get('/:id/report', validateObjectId('id'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) return next(createError(404, 'Vehicle not found'));

    const [documents, maintenance, expenses] = await Promise.all([
      Document.find({ vehicle: vehicle._id }).sort({ uploadedAt: -1 }).lean(),
      Maintenance.find({ vehicle: vehicle._id }).sort({ serviceDate: -1 }).lean(),
      Expense.find({ vehicle: vehicle._id }).sort({ date: -1 }).lean(),
    ]);

    const filename = `VehicleVault_Report_${vehicle.registrationNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await generateVehicleReport({ vehicle, documents, maintenance, expenses }, res);

    await logActivity(
      'REPORT_GENERATED',
      'Vehicle',
      vehicle._id,
      vehicle.registrationNumber,
      `Generated executive PDF vehicle report`,
      {},
      req
    );
  } catch (err) {
    next(err);
  }
});

// PUT /api/vehicles/:id — update a vehicle
router.put('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const {
      registrationNumber,
      make,
      model,
      year,
      fleetGroup,
      status,
      fuelType,
      assignedDriver,
      notes,
    } = req.body;

    const update = {};
    if (registrationNumber !== undefined) update.registrationNumber = registrationNumber;
    if (make !== undefined) update.make = make;
    if (model !== undefined) update.model = model;
    if (year !== undefined) update.year = year;
    if (fleetGroup !== undefined) update.fleetGroup = fleetGroup;
    if (status !== undefined) update.status = status;
    if (fuelType !== undefined) update.fuelType = fuelType;
    if (assignedDriver !== undefined) update.assignedDriver = assignedDriver;
    if (notes !== undefined) update.notes = notes;

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return next(createError(404, 'Vehicle not found'));

    await logActivity(
      'VEHICLE_UPDATED',
      'Vehicle',
      vehicle._id,
      vehicle.registrationNumber,
      `Vehicle specifications updated`,
      update,
      req
    );

    res.json({ message: 'Vehicle updated', vehicle });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/vehicles/:id — delete a vehicle and its documents, maintenance & expenses
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return next(createError(404, 'Vehicle not found'));

    const fileService = require('../services/fileService');
    const docs = await Document.find({ vehicle: vehicle._id });
    for (const doc of docs) {
      fileService.deleteFile(doc.storedFilename);
    }

    await Promise.all([
      Document.deleteMany({ vehicle: vehicle._id }),
      Maintenance.deleteMany({ vehicle: vehicle._id }),
      Expense.deleteMany({ vehicle: vehicle._id }),
      vehicle.deleteOne(),
    ]);

    await logActivity(
      'VEHICLE_DELETED',
      'Vehicle',
      vehicle._id,
      vehicle.registrationNumber,
      `Deleted vehicle along with ${docs.length} attached document files, service logs and expenses`,
      {},
      req
    );

    res.json({ message: 'Vehicle and associated records deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
