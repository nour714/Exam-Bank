const OCRProvider = require('./ocr.provider');

/**
 * Google Cloud Vision OCR adapter.
 * Requires `@google-cloud/vision` npm package when activated.
 */
class GoogleVisionProvider extends OCRProvider {
  constructor(config) {
    super();
    this.credentials = config.credentials;
    // this.client = new vision.ImageAnnotatorClient({ keyFilename: config.credentials });
  }

  async extractText(imageBuffer, options = {}) {
    // const [result] = await this.client.textDetection(imageBuffer);
    // const detections = result.textAnnotations;
    return {
      text: '[Google Vision] Extracted text from image',
      confidence: 95,
      structuredData: null,
      language: options.language || 'auto',
    };
  }
}

module.exports = GoogleVisionProvider;
