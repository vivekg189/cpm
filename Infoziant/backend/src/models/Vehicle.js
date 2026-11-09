// src/models/Vehicle.js
'use strict';

const mongoose = require('mongoose');

const FLEET_GROUPS = [
  'Personal',
  'Commercial Fleet',
  'Executive',
  'Delivery Vans',
  'Heavy Haulage',
  'Operations',
  'Other',
];

const VEHICLE_STATUSES = ['active', 'maintenance', 'inactive', 'sold'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Other'];

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Registration number must be 20 characters or fewer'],
    },
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
      maxlength: [50, 'Make must be 50 characters or fewer'],
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      maxlength: [50, 'Model must be 50 characters or fewer'],
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1886, 'Year must be 1886 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    fleetGroup: {
      type: String,
      enum: {
        values: FLEET_GROUPS,
        message: 'Invalid fleet group',
      },
      default: 'Personal',
    },
    status: {
      type: String,
      enum: {
        values: VEHICLE_STATUSES,
        message: 'Invalid status',
      },
      default: 'active',
    },
    fuelType: {
      type: String,
      enum: {
        values: FUEL_TYPES,
        message: 'Invalid fuel type',
      },
      default: 'Petrol',
    },
    assignedDriver: {
      name: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      licenseNumber: { type: String, trim: true, uppercase: true, default: '' },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be 500 characters or fewer'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual — count of associated documents (populated on demand)
vehicleSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'vehicle',
});

// Virtual — count of maintenance records
vehicleSchema.virtual('maintenance', {
  ref: 'Maintenance',
  localField: '_id',
  foreignField: 'vehicle',
});

// Virtual — count of expenses
vehicleSchema.virtual('expenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'vehicle',
});

vehicleSchema.index({ fleetGroup: 1 });
vehicleSchema.index({ status: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
module.exports.FLEET_GROUPS = FLEET_GROUPS;
module.exports.VEHICLE_STATUSES = VEHICLE_STATUSES;
module.exports.FUEL_TYPES = FUEL_TYPES;
