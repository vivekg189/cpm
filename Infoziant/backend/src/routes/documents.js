// src/routes/documents.js — PDF upload, OCR scanning, listing, download, validation, and deletion
'use strict';

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Document = require('../models/Document');
const Vehicle = require('../models/Vehicle');
const { upload, isPdfBySignature } = require('../services/uploadService');
const fileService = require('../services/fileService');
const validateObjectId = require('../middleware/validateObjectId');
const { createError } = require('../middleware/errorHandler');
const { scanDocument } = require('../services/ocrService');
const { logActivity } = require('../services/activityService');

const router = express.Router();

// GET /api/documents — list all documents (with vehicle info)
router.get('/', async (req, res, next) => {
  try {
    const { vehicleId, documentType } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicle = vehicleId;
    if (documentType && documentType !== 'ALL') filter.documentType = documentType;

    const documents = await Document.find(filter)
      .populate('vehicle', 'registrationNumber make model year fleetGroup')
      .sort({ uploadedAt: -1 })
      .lean({ virtuals: true });

    res.json({ count: documents.length, documents });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/scan-ocr — upload a PDF and extract text fields via OCR
router.post('/scan-ocr', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return next(err);

    let tempFilePath = null;
    try {
      if (!req.file) {
        return next(createError(400, 'No file uploaded for OCR scanning'));
      }

      tempFilePath = fileService.safeFilePath(req.file.filename);

      if (!isPdfBySignature(tempFilePath)) {
        fileService.deleteFile(req.file.filename);
        return next(createError(415, 'Uploaded file does not appear to be a valid PDF'));
      }

      const ocrResult = await scanDocument(tempFilePath);

      // Clean up the temporary upload since it was only for OCR extraction
      fileService.deleteFile(req.file.filename);

      res.json({
        message: 'OCR Scan Completed',
        ...ocrResult,
      });
    } catch (scanErr) {
      if (req.file) fileService.deleteFile(req.file.filename);
      next(scanErr);
    }
  });
});

// POST /api/documents/validate — duplicate check & validation
router.post('/validate', async (req, res, next) => {
  try {
    const { vehicleId, documentType, filename } = req.body;
    if (!vehicleId || !documentType) {
      return next(createError(400, 'vehicleId and documentType are required for validation'));
    }

    const now = new Date();

    // Check if vehicle already has an active document of this category
    const existingActiveDoc = await Document.findOne({
      vehicle: vehicleId,
      documentType,
      $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }],
    }).lean();

    const existingNamedDoc = filename
      ? await Document.findOne({ vehicle: vehicleId, originalFilename: filename }).lean()
      : null;

    const isDuplicate = !!(existingActiveDoc || existingNamedDoc);

    res.json({
      isValid: true,
      hasDuplicateWarning: isDuplicate,
      existingDocument: existingActiveDoc || existingNamedDoc,
      warningMessage: existingActiveDoc
        ? `An active ${documentType} already exists for this vehicle (Expires: ${existingActiveDoc.expiryDate ? new Date(existingActiveDoc.expiryDate).toLocaleDateString() : 'No expiry'}).`
        : existingNamedDoc
        ? `A document with the identical filename "${filename}" was previously uploaded.`
        : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents — upload a PDF document
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return next(err);

    try {
      if (!req.file) {
        return next(createError(400, 'No file uploaded. Send a PDF as the "file" field.'));
      }

      const { title, documentType, vehicleId, expiryDate, ocrData } = req.body;

      if (!title || !documentType || !vehicleId) {
        fileService.deleteFile(req.file.filename);
        return next(createError(400, 'title, documentType, and vehicleId are required'));
      }

      // Verify vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        fileService.deleteFile(req.file.filename);
        return next(createError(404, 'Vehicle not found'));
      }

      // Verify PDF magic bytes
      const filePath = fileService.safeFilePath(req.file.filename);
      if (!isPdfBySignature(filePath)) {
        fileService.deleteFile(req.file.filename);
        return next(createError(415, 'Uploaded file does not appear to be a valid PDF'));
      }

      // Compute SHA-256 hash for duplicate file verification
      const fileBuffer = fs.readFileSync(filePath);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Check for exact file duplicate in database
      const exactDuplicate = await Document.findOne({ vehicle: vehicle._id, fileHash }).lean();
      if (exactDuplicate) {
        fileService.deleteFile(req.file.filename);
        return next(
          createError(
            409,
            `This exact file has already been uploaded as "${exactDuplicate.title}" for vehicle ${vehicle.registrationNumber}.`
          )
        );
      }

      let parsedOcr = null;
      if (ocrData) {
        try {
          parsedOcr = typeof ocrData === 'string' ? JSON.parse(ocrData) : ocrData;
        } catch (_) {}
      }

      const doc = new Document({
        title,
        documentType,
        vehicle: vehicle._id,
        originalFilename: req.file.originalname,
        storedFilename: req.file.filename,
        fileSize: req.file.size,
        fileHash,
        mimeType: req.file.mimetype,
        expiryDate: expiryDate || null,
        ocrExtractedData: parsedOcr,
      });

      await doc.save();
      await doc.populate('vehicle', 'registrationNumber make model year fleetGroup');

      await logActivity(
        'DOCUMENT_UPLOADED',
        'Document',
        doc._id,
        `${title} (${vehicle.registrationNumber})`,
        `Uploaded ${documentType} PDF (${(req.file.size / 1024).toFixed(1)} KB)`,
        { documentType, fileSize: req.file.size },
        req
      );

      res.status(201).json({ message: 'Document uploaded successfully', document: doc });
    } catch (err) {
      if (req.file) fileService.deleteFile(req.file.filename);
      next(err);
    }
  });
});

// GET /api/documents/:id — get document metadata
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('vehicle', 'registrationNumber make model year fleetGroup')
      .lean({ virtuals: true });
    if (!doc) return next(createError(404, 'Document not found'));
    res.json({ document: doc });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/download — stream the PDF file
router.get('/:id/download', validateObjectId('id'), async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) return next(createError(404, 'Document not found'));

    if (!fileService.fileExists(doc.storedFilename)) {
      return next(createError(404, 'File not found on server. It may have been deleted.'));
    }

    const safeName = path.basename(doc.originalFilename).replace(/[^\w.\-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Length', doc.fileSize);

    const stream = fileService.createReadStream(doc.storedFilename);
    stream.on('error', (err) => {
      console.error('[download] Stream error:', err.message);
      if (!res.headersSent) next(createError(500, 'Failed to stream file'));
    });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id — delete document and its file
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).populate('vehicle', 'registrationNumber');
    if (!doc) return next(createError(404, 'Document not found'));

    fileService.deleteFile(doc.storedFilename);
    await doc.deleteOne();

    await logActivity(
      'DOCUMENT_DELETED',
      'Document',
      doc._id,
      doc.title,
      `Deleted document from vehicle ${doc.vehicle?.registrationNumber || 'Unknown'}`,
      {},
      req
    );

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
