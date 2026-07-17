class StorageProvider {
  /**
   * Upload a file to storage.
   * @param {Buffer|Stream} file
   * @param {string} destination - Path/Key
   * @param {Object} options - Metadata, contentType, etc.
   * @returns {Promise<Object>} { url, key, size }
   */
  async upload(file, destination, options) {
    throw new Error('Method not implemented.');
  }

  /**
   * Download a file from storage.
   * @param {string} key
   * @returns {Promise<Buffer|Stream>}
   */
  async download(key) {
    throw new Error('Method not implemented.');
  }

  /**
   * Generate a signed URL for secure, temporary access.
   * @param {string} key
   * @param {number} expiresIn - Seconds
   * @returns {Promise<string>}
   */
  async getSignedUrl(key, expiresIn = 3600) {
    throw new Error('Method not implemented.');
  }

  /**
   * Delete a file from storage.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    throw new Error('Method not implemented.');
  }
}

module.exports = StorageProvider;
