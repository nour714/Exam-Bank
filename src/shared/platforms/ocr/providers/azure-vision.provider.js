const OCRProvider = require('./ocr.provider');

/**
 * Azure Computer Vision OCR adapter.
 * Requires `@azure/cognitiveservices-computervision` when activated.
 */
class AzureVisionProvider extends OCRProvider {
  constructor(config) {
    super();
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
  }

  async extractText(imageBuffer, options = {}) {
    return {
      text: '[Azure Vision] Extracted text from image',
      confidence: 92,
      structuredData: null,
      language: options.language || 'auto',
    };
  }
}

module.exports = AzureVisionProvider;
