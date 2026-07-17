const LocalStorageProvider = require('./providers/local.provider');
const R2StorageProvider = require('./providers/r2.provider');
const { eventBus } = require('../../events');

class StorageService {
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
      throw new Error(`Storage Provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  async uploadFile(file, destination, options = {}) {
    const provider = this.getProvider(options.provider);
    const result = await provider.upload(file, destination, options);
    eventBus.publish('storage:file_uploaded', { key: destination, provider: options.provider || this.defaultProvider });
    return result;
  }

  async downloadFile(key, options = {}) {
    return this.getProvider(options.provider).download(key);
  }

  async getSignedUrl(key, expiresIn, options = {}) {
    return this.getProvider(options.provider).getSignedUrl(key, expiresIn);
  }

  async deleteFile(key, options = {}) {
    const provider = this.getProvider(options.provider);
    await provider.delete(key);
    eventBus.publish('storage:file_deleted', { key, provider: options.provider || this.defaultProvider });
  }
}

const { configProvider } = require('../../config');

const storageService = new StorageService();

// Config-based instantiation
const storageProviderName = configProvider.get('STORAGE_PROVIDER', 'local');
const r2AccountId = configProvider.get('R2_ACCOUNT_ID');

if (storageProviderName === 'r2' && r2AccountId) {
  storageService.registerProvider('r2', new R2StorageProvider({
    accountId: r2AccountId,
    bucket: configProvider.get('R2_BUCKET_NAME'),
  }), true);
} else {
  storageService.registerProvider('local', new LocalStorageProvider({}), true);
}

module.exports = storageService;
