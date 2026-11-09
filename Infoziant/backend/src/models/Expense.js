// src/models/Expense.js — vehicle expenses tracking
'use strict';

const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Fuel',
  'Maintenance & Repairs',
  'Insurance Premium',
  'Tolls & Permits',
  'Parking',
  'Cleaning & Detailing',
  'Accessories & Upgrades',
  'Fines & Violations',
  'Road Tax',
  'Other',
];

const PAYMENT_METHODS = [
  'Credit / Debit Card',
  'UPI / Digital Wallet',
  'Cash',
  'Net Banking',
  'Fleet Card',
  'Company Account',
];

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Associated vehicle is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: 'Invalid expense category',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: 'Invalid payment method',
      },
      default: 'Credit / Debit Card',
    },
    vendorOrStation: {
      type: String,
      trim: true,
      default: '',
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: '',
    },
    fuelQuantityLiters: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: null,
    },
    odometerReading: {
      type: Number,
      min: [0, 'Odometer reading cannot be negative'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be 500 characters or fewer'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

expenseSchema.index({ vehicle: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;

