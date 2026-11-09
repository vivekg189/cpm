// src/services/reportService.js — generates comprehensive executive PDF vehicle reports
'use strict';

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate a comprehensive vehicle report and stream it to the response.
 */
async function generateVehicleReport({ vehicle, documents = [], maintenance = [], expenses = [] }, stream) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `VehicleVault Report - ${vehicle.registrationNumber}`,
          Author: 'VehicleVault Enterprise',
          Subject: 'Vehicle Compliance & Maintenance Summary',
        },
      });

      doc.on('error', reject);
      stream.on('finish', resolve);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#2563EB';
      const secondaryColor = '#0F172A';
      const grayColor = '#64748B';
      const lightBg = '#F8FAFC';
      const borderColor = '#E2E8F0';

      // 1. Header & Title Banner
      doc.rect(40, 40, 515, 60).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('VEHICLEVAULT', 55, 52);
      doc.fontSize(10).font('Helvetica').text('Smart Vehicle Document & Fleet Compliance Report', 55, 76);

      // Report metadata on right side of banner
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      doc.fontSize(9).font('Helvetica').text(`Generated: ${reportDate}`, 380, 55, { align: 'right', width: 160 });
      doc.text(`Status: Official Report`, 380, 72, { align: 'right', width: 160 });

      doc.moveDown(3);

      // 2. Vehicle Overview & QR Code
      const qrData = `VehicleVault Verification\nReg: ${vehicle.registrationNumber}\nMake: ${vehicle.make} ${vehicle.model} (${vehicle.year})\nFleet: ${vehicle.fleetGroup || 'Personal'}\nStatus: ${vehicle.status || 'Active'}`;
      const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 100 });
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

      const yStart = 120;
      doc.rect(40, yStart, 515, 110).fillAndStroke(lightBg, borderColor);

      // Vehicle Registration & Specs
      doc.fillColor(secondaryColor).fontSize(16).font('Helvetica-Bold').text(vehicle.registrationNumber, 55, yStart + 15);
      doc.fillColor(grayColor).fontSize(11).font('Helvetica').text(`${vehicle.make} ${vehicle.model} • ${vehicle.year}`, 55, yStart + 36);

      doc.fontSize(9).font('Helvetica-Bold').fillColor(secondaryColor).text('Fleet Category: ', 55, yStart + 60);
      doc.font('Helvetica').fillColor(grayColor).text(vehicle.fleetGroup || 'Personal', 135, yStart + 60);

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Vehicle Status: ', 55, yStart + 75);
      doc.font('Helvetica').fillColor(grayColor).text((vehicle.status || 'active').toUpperCase(), 135, yStart + 75);

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Fuel Type: ', 55, yStart + 90);
      doc.font('Helvetica').fillColor(grayColor).text(vehicle.fuelType || 'Petrol', 135, yStart + 90);

      // Driver info
      const driverName = vehicle.assignedDriver?.name || 'Unassigned';
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Assigned Driver: ', 240, yStart + 60);
      doc.font('Helvetica').fillColor(grayColor).text(driverName, 330, yStart + 60);

      const driverPhone = vehicle.assignedDriver?.phone || '—';
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Driver Contact: ', 240, yStart + 75);
      doc.font('Helvetica').fillColor(grayColor).text(driverPhone, 330, yStart + 75);

      // Embed QR Code on right
      doc.image(qrBuffer, 440, yStart + 10, { width: 90, height: 90 });
      doc.fontSize(7).fillColor(grayColor).text('Scan to Verify', 440, yStart + 98, { width: 90, align: 'center' });

      // 3. Document Compliance Table
      let currentY = yStart + 130;
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('1. DOCUMENT VAULT & COMPLIANCE STATUS', 40, currentY);
      currentY += 18;

      // Table Header
      doc.rect(40, currentY, 515, 20).fill('#E2E8F0');
      doc.fillColor(secondaryColor).fontSize(8).font('Helvetica-Bold');
      doc.text('DOCUMENT TITLE', 50, currentY + 6);
      doc.text('TYPE', 200, currentY + 6);
      doc.text('UPLOADED', 310, currentY + 6);
      doc.text('EXPIRY DATE', 380, currentY + 6);
      doc.text('STATUS', 470, currentY + 6);
      currentY += 20;

      if (documents.length === 0) {
        doc.rect(40, currentY, 515, 22).fillAndStroke('#FFFFFF', borderColor);
        doc.fillColor(grayColor).fontSize(8).font('Helvetica').text('No documents uploaded for this vehicle.', 50, currentY + 7);
        currentY += 22;
      } else {
        const now = new Date();
        documents.slice(0, 7).forEach((d) => {
          doc.rect(40, currentY, 515, 22).fillAndStroke('#FFFFFF', borderColor);
          doc.fillColor(secondaryColor).fontSize(8).font('Helvetica-Bold').text(d.title.substring(0, 26), 50, currentY + 7);
          doc.font('Helvetica').fillColor(grayColor).text(d.documentType.substring(0, 18), 200, currentY + 7);
          doc.text(new Date(d.uploadedAt).toLocaleDateString(), 310, currentY + 7);

          if (d.expiryDate) {
            const expDate = new Date(d.expiryDate);
            doc.text(expDate.toLocaleDateString(), 380, currentY + 7);

            if (expDate < now) {
              doc.fillColor('#DC2626').font('Helvetica-Bold').text('EXPIRED', 470, currentY + 7);
            } else {
              const days = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
              if (days <= 30) {
                doc.fillColor('#D97706').font('Helvetica-Bold').text(`${days}d left`, 470, currentY + 7);
              } else {
                doc.fillColor('#10B981').font('Helvetica-Bold').text('VALID', 470, currentY + 7);
              }
            }
          } else {
            doc.text('—', 380, currentY + 7);
            doc.fillColor(grayColor).font('Helvetica').text('No Expiry', 470, currentY + 7);
          }

          currentY += 22;
        });
      }

      currentY += 15;

      // 4. Maintenance & Service History
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('2. RECENT SERVICE & MAINTENANCE HISTORY', 40, currentY);
      currentY += 18;

      doc.rect(40, currentY, 515, 20).fill('#E2E8F0');
      doc.fillColor(secondaryColor).fontSize(8).font('Helvetica-Bold');
      doc.text('DATE', 50, currentY + 6);
      doc.text('SERVICE TYPE', 120, currentY + 6);
      doc.text('WORKSHOP', 270, currentY + 6);
      doc.text('ODOMETER', 380, currentY + 6);
      doc.text('COST', 470, currentY + 6);
      currentY += 20;

      if (maintenance.length === 0) {
        doc.rect(40, currentY, 515, 22).fillAndStroke('#FFFFFF', borderColor);
        doc.fillColor(grayColor).fontSize(8).font('Helvetica').text('No service records logged yet.', 50, currentY + 7);
        currentY += 22;
      } else {
        maintenance.slice(0, 5).forEach((m) => {
          doc.rect(40, currentY, 515, 22).fillAndStroke('#FFFFFF', borderColor);
          doc.fillColor(grayColor).fontSize(8).font('Helvetica').text(new Date(m.serviceDate).toLocaleDateString(), 50, currentY + 7);
          doc.fillColor(secondaryColor).font('Helvetica-Bold').text(m.serviceType.substring(0, 24), 120, currentY + 7);
          doc.font('Helvetica').fillColor(grayColor).text(m.performedBy.substring(0, 18), 270, currentY + 7);
          doc.text(`${m.odometerReading} km`, 380, currentY + 7);
          doc.fillColor(primaryColor).font('Helvetica-Bold').text(`Rs. ${m.cost.toLocaleString()}`, 470, currentY + 7);
          currentY += 22;
        });
      }

      currentY += 15;

      // 5. Expense Summary
      const totalExpense = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const totalServiceCost = maintenance.reduce((acc, curr) => acc + (curr.cost || 0), 0);

      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('3. EXPENDITURE OVERVIEW', 40, currentY);
      currentY += 18;

      doc.rect(40, currentY, 515, 50).fillAndStroke(lightBg, borderColor);
      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold').text('Total Logged Expenses: ', 55, currentY + 12);
      doc.fillColor(primaryColor).fontSize(11).text(`Rs. ${totalExpense.toLocaleString()}`, 175, currentY + 10);

      doc.fillColor(secondaryColor).fontSize(9).text('Total Service Costs: ', 55, currentY + 30);
      doc.fillColor(primaryColor).fontSize(11).text(`Rs. ${totalServiceCost.toLocaleString()}`, 175, currentY + 28);

      doc.fillColor(grayColor).fontSize(8).font('Helvetica').text(
        `Recorded expenses cover fuel, insurance, toll, maintenance, and administrative fees.`,
        310,
        currentY + 12,
        { width: 230 }
      );

      // 6. Footer Disclaimer & Page Number
      doc.fontSize(8).fillColor(grayColor).text(
        'CONFIDENTIAL • VehicleVault Automated Report • Keep this document for regulatory audit and service tracking.',
        40,
        780,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateVehicleReport,
};

