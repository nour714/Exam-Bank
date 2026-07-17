/**
 * Platform Abstractions barrel.
 *
 * All business modules import platform services from this single entry point:
 *   const { aiService, storageService } = require('../shared/platforms');
 *
 * No business module ever imports a provider directly.
 */

const { aiService, AIProvider } = require('./ai');
const { storageService, StorageProvider } = require('./storage');
const { ocrService, OCRProvider } = require('./ocr');
const { searchService, SearchProvider } = require('./search');
const { notificationService, templateEngine, NotificationProvider } = require('./notification');
const { paymentService, PaymentProvider } = require('./payments');

module.exports = {
  // ─── AI Platform ───────────────────────────────────
  aiService,
  AIProvider,

  // ─── Storage Platform ──────────────────────────────
  storageService,
  StorageProvider,

  // ─── OCR Platform ──────────────────────────────────
  ocrService,
  OCRProvider,

  // ─── Search Platform ───────────────────────────────
  searchService,
  SearchProvider,

  // ─── Notification Platform ─────────────────────────
  notificationService,
  templateEngine,
  NotificationProvider,

  // ─── Payment Platform ──────────────────────────────
  paymentService,
  PaymentProvider,
};
