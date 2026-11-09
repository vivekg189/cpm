// src/models/ActivityLog.js — audit trail of all system events
'use strict';

const mongoose = require('mongoose');

const ACTIVITY_ACTIONS = [
  'VEHICLE_CREATED',
  'VEHICLE_UPDATED',
  'VEHICLE_DELETED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_DELETED',
  'MAINTENANCE_CREATED',
  'MAINTENANCE_UPDATED',
  'MAINTENANCE_DELETED',
  'EXPENSE_CREATED',
  'EXPENSE_DELETED',
  'REPORT_GENERATED',
  'SYSTEM_CHECK',
];

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ACTIVITY_ACTIONS,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Vehicle', 'Document', 'Maintenance', 'Expense', 'System', 'Report'],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    entityName: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
module.exports.ACTIVITY_ACTIONS = ACTIVITY_ACTIONS;

