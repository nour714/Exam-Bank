const StorageProvider = require('./storage.provider');

/**
 * AWS S3 storage adapter.
 * Requires `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` when activated.
 */
class S3StorageProvider extends StorageProvider {
  constructor(config) {
    super();
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    // this.s3Client = new S3Client({ region: this.region, credentials: { ... } });
  }

  async upload(file, destination, options = {}) {
    // await this.s3Client.send(new PutObjectCommand({ Bucket: this.bucket, Key: destination, Body: file, ContentType: options.contentType }));
    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${destination}`,
      key: destination,
      size: file.length || 0,
    };
  }

  async download(key) {
    // const { Body } = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return Buffer.from('dummy-s3-content');
  }

  async getSignedUrl(key, expiresIn = 3600) {
    // return getSignedUrl(this.s3Client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn });
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Signature=dummy`;
  }

  async delete(key) {
    // await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

module.exports = S3StorageProvider;
