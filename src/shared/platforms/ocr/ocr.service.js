const TesseractProvider = require('./providers/tesseract.provider');
const { eventBus } = require('../../events');

class OCRService {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
  }

  registerProvider(name, providerInstance, isDefault = false) {
    this.providers.set(name, providerInstance);
    if (isDefault || !this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  getProvider(name) {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`OCR Provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  async extractText(imageBuffer, options = {}) {
    const provider = this.getProvider(options.provider);
    const result = await provider.extractText(imageBuffer, options);
    
    eventBus.publish('ocr:processed', {
      provider: options.provider || this.defaultProvider,
      confidence: result.confidence,
    });
    
    return result;
  }
}

const ocrService = new OCRService();
ocrService.registerProvider('tesseract', new TesseractProvider({}), true);

module.exports = ocrService;
