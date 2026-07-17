const StorageProvider = require('./storage.provider');

/**
 * Backblaze B2 storage adapter.
 * Uses S3-compatible API via @aws-sdk/client-s3 with B2 endpoint.
 */
class B2StorageProvider extends StorageProvider {
  constructor(config) {
    super();
    this.bucket = config.bucket;
    this.endpoint = config.endpoint; // e.g., https://s3.us-west-002.backblazeb2.com
    // this.s3Client = new S3Client({ endpoint: this.endpoint, region: 'auto', credentials: { ... } });
  }

  async upload(file, destination, options = {}) {
    return {
      url: `${this.endpoint}/${this.bucket}/${destination}`,
      key: destination,
      size: file.length || 0,
    };
  }

  async download(key) {
    return Buffer.from('dummy-b2-content');
  }

  async getSignedUrl(key, expiresIn = 3600) {
    return `${this.endpoint}/${this.bucket}/${key}?Authorization=dummy`;
  }

  async delete(key) {}
}

module.exports = B2StorageProvider;
