// src/models/Maintenance.js — vehicle service & maintenance history
'use strict';

const mongoose = require('mongoose');

const SERVICE_TYPES = [
  'Oil & Filter Change',
  'Brake System Service',
  'Tire Rotation & Balancing',
  'General Periodic Service',
  'Engine & Transmission Tune-Up',
  'Battery & Electrical Check',
  'Cooling System Flush',
  'Suspension & Wheel Alignment',
  'Air Conditioning Service',
  'Bodywork & Painting',
  'Emergency Repair',
  'Other Inspection',
];

const MAINTENANCE_STATUSES = ['completed', 'scheduled', 'in_progress'];

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Associated vehicle is required'],
      index: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: {
        values: SERVICE_TYPES,
        message: 'Invalid service type',
      },
    },
    serviceDate: {
      type: Date,
      required: [true, 'Service date is required'],
      default: Date.now,
    },
    odometerReading: {
      type: Number,
      required: [true, 'Odometer reading (km) is required'],
      min: [0, 'Odometer reading cannot be negative'],
    },
    cost: {
      type: Number,
      required: [true, 'Maintenance cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    performedBy: {
      type: String,
      required: [true, 'Service provider / workshop name is required'],
      trim: true,
      maxlength: [100, 'Workshop name must be 100 characters or fewer'],
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    nextServiceDue: {
      date: { type: Date, default: null },
      odometer: { type: Number, default: null },
    },
    status: {
      type: String,
      enum: {
        values: MAINTENANCE_STATUSES,
        message: 'Invalid status',
      },
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be 1000 characters or fewer'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

maintenanceSchema.index({ vehicle: 1, serviceDate: -1 });
maintenanceSchema.index({ 'nextServiceDue.date': 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;
module.exports.MAINTENANCE_STATUSES = MAINTENANCE_STATUSES;

