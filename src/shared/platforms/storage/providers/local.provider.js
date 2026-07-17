const StorageProvider = require('./storage.provider');
const fs = require('fs/promises');
const path = require('path');

class LocalStorageProvider extends StorageProvider {
  constructor(config) {
    super();
    this.baseDir = config.baseDir || path.join(process.cwd(), 'uploads');
  }

  async upload(file, destination, options) {
    const fullPath = path.join(this.baseDir, destination);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Simulate writing (assuming 'file' is a buffer for this simple mock)
    await fs.writeFile(fullPath, file);
    
    return {
      url: `/uploads/${destination}`,
      key: destination,
      size: file.length || 0,
    };
  }

  async download(key) {
    const fullPath = path.join(this.baseDir, key);
    return fs.readFile(fullPath);
  }

  async getSignedUrl(key, expiresIn = 3600) {
    // In local dev, signed URLs are just direct links, or a mock JWT token URL.
    return `http://localhost:${process.env.PORT || 3000}/uploads/${key}?mockSig=123`;
  }

  async delete(key) {
    const fullPath = path.join(this.baseDir, key);
    await fs.unlink(fullPath).catch(() => {}); // Ignore if not exists
  }
}

module.exports = LocalStorageProvider;
