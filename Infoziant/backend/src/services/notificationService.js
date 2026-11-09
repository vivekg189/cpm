// src/services/notificationService.js — scans documents & triggers reminder alerts
'use strict';

const Notification = require('../models/Notification');
const Document = require('../models/Document');
const Maintenance = require('../models/Maintenance');

/**
 * Scan all documents and upcoming maintenance to generate automated milestone notifications.
 */
async function syncExpiryNotifications() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);

    // 1. Fetch documents that have an expiryDate within the active notification window or already expired
    const documents = await Document.find({
      expiryDate: { $ne: null, $lte: thirtyDaysFromNow },
    }).populate('vehicle', 'registrationNumber make model');

    for (const doc of documents) {
      if (!doc.expiryDate) continue;

      const diffTime = doc.expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const vehNumber = doc.vehicle?.registrationNumber || 'Vehicle';
      const expiryDateStr = doc.expiryDate.toISOString().split('T')[0];

      let reminderType = null;
      let urgency = 'info';
      let title = '';
      let message = '';

      if (daysRemaining <= 0) {
        reminderType = 'expired';
        urgency = 'critical';
        title = `EXPIRED: ${doc.title} (${vehNumber})`;
        message = `Document "${doc.title}" expired on ${new Date(doc.expiryDate).toLocaleDateString()}. Please renew immediately.`;
      } else if (daysRemaining === 1) {
        reminderType = '1_day';
        urgency = 'critical';
        title = `URGENT: ${doc.title} expires tomorrow!`;
        message = `${doc.documentType} for vehicle ${vehNumber} expires in less than 24 hours.`;
      } else if (daysRemaining <= 7) {
        reminderType = '7_days';
        urgency = 'warning';
        title = `7-Day Expiry Warning: ${doc.title}`;
        message = `${doc.documentType} for ${vehNumber} expires in ${daysRemaining} days (${new Date(doc.expiryDate).toLocaleDateString()}).`;
      } else if (daysRemaining <= 15) {
        reminderType = '15_days';
        urgency = 'warning';
        title = `15-Day Expiry Notice: ${doc.title}`;
        message = `${doc.documentType} for ${vehNumber} will expire in ${daysRemaining} days.`;
      } else if (daysRemaining <= 30) {
        reminderType = '30_days';
        urgency = 'info';
        title = `30-Day Reminder: ${doc.title}`;
        message = `${doc.documentType} for ${vehNumber} is due for renewal on ${new Date(doc.expiryDate).toLocaleDateString()}.`;
      }

      if (reminderType) {
        const dedupKey = `doc_${doc._id}_${reminderType}_${expiryDateStr}`;

        // Upsert notification without creating spam duplicates
        await Notification.findOneAndUpdate(
          { dedupKey },
          {
            $setOnInsert: {
              title,
              message,
              type: reminderType,
              urgency,
              document: doc._id,
              vehicle: doc.vehicle?._id || doc.vehicle,
              dueDate: doc.expiryDate,
              daysRemaining,
              isRead: false,
              createdAt: new Date(),
            },
          },
          { upsert: true, new: false }
        );
      }
    }

    // 2. Scan upcoming Maintenance tasks
    const upcomingServices = await Maintenance.find({
      'nextServiceDue.date': { $ne: null, $gte: now, $lte: thirtyDaysFromNow },
      status: { $ne: 'completed' },
    }).populate('vehicle', 'registrationNumber make model');

    for (const service of upcomingServices) {
      const dueDate = service.nextServiceDue.date;
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const vehNumber = service.vehicle?.registrationNumber || 'Vehicle';
      const dateStr = dueDate.toISOString().split('T')[0];
      const dedupKey = `service_${service._id}_due_${dateStr}`;

      await Notification.findOneAndUpdate(
        { dedupKey },
        {
          $setOnInsert: {
            title: `Service Due Soon: ${service.serviceType}`,
            message: `Scheduled maintenance for vehicle ${vehNumber} is due on ${new Date(dueDate).toLocaleDateString()} (${diffDays} days).`,
            type: 'maintenance_due',
            urgency: diffDays <= 7 ? 'warning' : 'info',
            vehicle: service.vehicle?._id || service.vehicle,
            dueDate,
            daysRemaining: diffDays,
            isRead: false,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: false }
      );
    }
  } catch (err) {
    console.error('[NotificationService] Error syncing notifications:', err.message);
  }
}

module.exports = {
  syncExpiryNotifications,
};

