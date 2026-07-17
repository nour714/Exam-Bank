const OCRProvider = require('./ocr.provider');

class TesseractProvider extends OCRProvider {
  constructor(config) {
    super();
    // this.worker = createWorker();
  }

  async extractText(imageBuffer, options = {}) {
    // Dummy tesseract.js integration
    return {
      text: "[Tesseract] Extracted text from image",
      confidence: 85,
      structuredData: null,
      language: options.language || 'eng',
    };
  }
}

module.exports = TesseractProvider;
