const OCRProvider = require('./ocr.provider');

/**
 * EasyOCR adapter (Python-based, invoked via child process or REST microservice).
 * Suitable for offline/self-hosted OCR without cloud dependencies.
 */
class EasyOCRProvider extends OCRProvider {
  constructor(config) {
    super();
    this.serviceUrl = config.serviceUrl || 'http://localhost:5001/ocr';
  }

  async extractText(imageBuffer, options = {}) {
    // In production: POST to a Python EasyOCR microservice
    // const response = await fetch(this.serviceUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/octet-stream' },
    //   body: imageBuffer,
    // });
    return {
      text: '[EasyOCR] Extracted text from image',
      confidence: 88,
      structuredData: null,
      language: options.language || 'auto',
    };
  }
}

module.exports = EasyOCRProvider;
