class OCRProvider {
  /**
   * Process an image buffer and extract text.
   * @param {Buffer} imageBuffer 
   * @param {Object} options - Language, hints, etc.
   * @returns {Promise<Object>} { text: string, confidence: number, structuredData: Object }
   */
  async extractText(imageBuffer, options) {
    throw new Error('Method not implemented.');
  }

  /**
   * Batch process multiple images.
   * @param {Buffer[]} imageBuffers 
   * @param {Object} options 
   * @returns {Promise<Object[]>}
   */
  async extractTextBatch(imageBuffers, options) {
    return Promise.all(imageBuffers.map(buf => this.extractText(buf, options)));
  }
}

module.exports = OCRProvider;
