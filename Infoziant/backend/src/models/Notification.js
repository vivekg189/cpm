// src/models/Notification.js — automated expiry and reminder notifications
'use strict';

const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  '30_days',
  '15_days',
  '7_days',
  '1_day',
  'expired',
  'maintenance_due',
  'system',
];

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: '30_days',
    },
    urgency: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    daysRemaining: {
      type: Number,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    dedupKey: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

