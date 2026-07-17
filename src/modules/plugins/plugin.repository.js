const { getPrismaClient } = require('../../shared/database');

class PluginRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  async getMarketplacePlugins(options = {}) {
    return this.prisma.plugin.findMany({
      where: { isActive: true, isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstalledPlugins(tenantId) {
    return this.prisma.tenantPlugin.findMany({
      where: { tenantId, isEnabled: true },
      include: { plugin: true },
    });
  }

  async installPlugin(tenantId, pluginId, config = {}) {
    return this.prisma.tenantPlugin.create({
      data: { tenantId, pluginId, config },
    });
  }

  async uninstallPlugin(tenantId, pluginId) {
    return this.prisma.tenantPlugin.delete({
      where: { tenantId_pluginId: { tenantId, pluginId } },
    });
  }

  async updatePluginConfig(tenantId, pluginId, config) {
    return this.prisma.tenantPlugin.update({
      where: { tenantId_pluginId: { tenantId, pluginId } },
      data: { config },
    });
  }
}

module.exports = new PluginRepository();
