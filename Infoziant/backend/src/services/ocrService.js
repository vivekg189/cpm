// src/services/ocrService.js — OCR text extraction & automated field parsing
'use strict';

const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Scan a PDF file buffer or path, extracting text and inferring compliance fields.
 */
async function scanDocument(fileInput) {
  try {
    let dataBuffer;
    if (Buffer.isBuffer(fileInput)) {
      dataBuffer = fileInput;
    } else if (typeof fileInput === 'string' && fs.existsSync(fileInput)) {
      dataBuffer = fs.readFileSync(fileInput);
    } else {
      throw new Error('Invalid file input provided for OCR scanning');
    }

    // Parse text from PDF
    const parsedPdf = await pdfParse(dataBuffer);
    const rawText = parsedPdf.text || '';

    return parseExtractedText(rawText);
  } catch (err) {
    console.error('[OCR] Extraction error:', err.message);
    return {
      success: false,
      error: err.message,
      confidence: 0,
      extractedFields: {},
      rawSnippet: '',
    };
  }
}

/**
 * Intelligent regex and heuristic rule engine to parse vehicle documents.
 */
function parseExtractedText(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
  const lower = normalized.toLowerCase();

  // 1. Detect Document Type
  let detectedType = 'Other';
  let typeConfidence = 50;

  if (
    lower.includes('insurance') ||
    lower.includes('policy') ||
    lower.includes('underwriter') ||
    lower.includes('third party liability')
  ) {
    detectedType = 'Insurance';
    typeConfidence = 90;
  } else if (
    lower.includes('pollution under control') ||
    lower.includes('pucc') ||
    lower.includes('emission test') ||
    lower.includes('pollution certificate')
  ) {
    detectedType = 'Pollution Certificate';
    typeConfidence = 95;
  } else if (
    lower.includes('registration certificate') ||
    lower.includes('form 23') ||
    lower.includes('certificate of registration') ||
    lower.includes('chassis number') ||
    lower.includes('engine number')
  ) {
    detectedType = 'Registration Certificate';
    typeConfidence = 92;
  } else if (
    lower.includes('fitness certificate') ||
    lower.includes('form 38') ||
    lower.includes('inspection certificate')
  ) {
    detectedType = 'Fitness Certificate';
    typeConfidence = 88;
  } else if (
    lower.includes('road tax') ||
    lower.includes('tax token') ||
    lower.includes('motor vehicles tax')
  ) {
    detectedType = 'Road Tax';
    typeConfidence = 85;
  } else if (
    lower.includes('permit') ||
    lower.includes('stage carriage') ||
    lower.includes('contract carriage')
  ) {
    detectedType = 'Permit';
    typeConfidence = 85;
  }

  // 2. Detect Registration Number (e.g. MH12AB1234, DL 01 A 1234, KA-05-MB-9876)
  const regPattern = /\b([A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4})\b/i;
  const regMatch = normalized.match(regPattern);
  const detectedRegistration = regMatch ? regMatch[1].replace(/[- ]/g, '').toUpperCase() : null;

  // 3. Detect Expiry / Valid Till Date
  let detectedExpiry = null;
  const expiryPatterns = [
    /(?:valid(?:ity)?(?: until| till| to)?|expir(?:y|es|ation)|period to|upto)[:\s]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
    /(?:valid(?:ity)?(?: until| till| to)?|expir(?:y|es|ation)|period to|upto)[:\s]+(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/i,
    /to[:\s]+(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/i,
  ];

  for (const pattern of expiryPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const parsedDate = parseDateString(match[1]);
      if (parsedDate && !isNaN(parsedDate.getTime())) {
        detectedExpiry = parsedDate.toISOString().split('T')[0];
        break;
      }
    }
  }

  // Fallback: search for general future dates if no explicit expiry keyword matched
  if (!detectedExpiry) {
    const generalDatePattern = /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/g;
    let match;
    const foundDates = [];
    while ((match = generalDatePattern.exec(normalized)) !== null) {
      const d = parseDateString(match[1]);
      if (d && !isNaN(d.getTime())) {
        foundDates.push(d);
      }
    }
    // Take the latest found date as probable expiry
    if (foundDates.length > 0) {
      foundDates.sort((a, b) => b.getTime() - a.getTime());
      const latest = foundDates[0];
      const now = new Date();
      if (latest > now) {
        detectedExpiry = latest.toISOString().split('T')[0];
      }
    }
  }

  // 4. Detect Policy / Certificate Number
  const certNumberPattern = /(?:policy|certificate|puc|rc|tax token|permit)\s*(?:no|number|#)?[:\s]+([A-Z0-9/\-]{6,30})/i;
  const certMatch = normalized.match(certNumberPattern);
  const detectedDocNumber = certMatch ? certMatch[1].trim() : null;

  // 5. Generate intelligent Title
  let suggestedTitle = `${detectedType}`;
  if (detectedRegistration) {
    suggestedTitle += ` - ${detectedRegistration}`;
  }
  if (detectedExpiry) {
    const year = detectedExpiry.split('-')[0];
    suggestedTitle += ` (${year})`;
  }

  const confidence = Math.min(
    100,
    typeConfidence * 0.4 +
      (detectedRegistration ? 30 : 0) +
      (detectedExpiry ? 25 : 0) +
      (detectedDocNumber ? 5 : 0)
  );

  return {
    success: true,
    confidence: Math.round(confidence),
    suggestedTitle,
    documentType: detectedType,
    registrationNumber: detectedRegistration,
    expiryDate: detectedExpiry,
    documentNumber: detectedDocNumber,
    rawSnippet: normalized.substring(0, 450).trim(),
  };
}

/**
 * Standardize DD/MM/YYYY or YYYY/MM/DD to Javascript Date
 */
function parseDateString(dateStr) {
  const parts = dateStr.split(/[-/.]/);
  if (parts.length !== 3) return null;

  // If first part is 4 digits -> YYYY-MM-DD
  if (parts[0].length === 4) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // If last part is 4 digits -> DD-MM-YYYY (common in India/EU)
  if (parts[2].length === 4) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  return null;
}

module.exports = {
  scanDocument,
  parseExtractedText,
};

