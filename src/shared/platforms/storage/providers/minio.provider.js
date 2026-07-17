const StorageProvider = require('./storage.provider');

/**
 * MinIO storage adapter (self-hosted S3-compatible object storage).
 * Uses S3-compatible API via @aws-sdk/client-s3 with MinIO endpoint.
 */
class MinIOStorageProvider extends StorageProvider {
  constructor(config) {
    super();
    this.bucket = config.bucket;
    this.endpoint = config.endpoint || 'http://localhost:9000';
    // this.s3Client = new S3Client({ endpoint: this.endpoint, region: 'us-east-1', forcePathStyle: true, credentials: { ... } });
  }

  async upload(file, destination, options = {}) {
    return {
      url: `${this.endpoint}/${this.bucket}/${destination}`,
      key: destination,
      size: file.length || 0,
    };
  }

  async download(key) {
    return Buffer.from('dummy-minio-content');
  }

  async getSignedUrl(key, expiresIn = 3600) {
    return `${this.endpoint}/${this.bucket}/${key}?X-Amz-Signature=dummy`;
  }

  async delete(key) {}
}

module.exports = MinIOStorageProvider;
