const pluginRepository = require('./plugin.repository');
const { eventBus } = require('../../shared/events');

class PluginService {
  async getMarketplace() {
    return pluginRepository.getMarketplacePlugins();
  }

  async getInstalled(tenantId) {
    return pluginRepository.getInstalledPlugins(tenantId);
  }

  async installPlugin(tenantId, pluginId, config, currentUserId) {
    // In production, we'd also trigger plugin lifecycle hooks (onInstall) here
    const installed = await pluginRepository.installPlugin(tenantId, pluginId, config);
    eventBus.publish('plugin:installed', { tenantId, pluginId, installedBy: currentUserId });
    return installed;
  }

  async uninstallPlugin(tenantId, pluginId, currentUserId) {
    // Trigger onUninstall hook
    await pluginRepository.uninstallPlugin(tenantId, pluginId);
    eventBus.publish('plugin:uninstalled', { tenantId, pluginId, uninstalledBy: currentUserId });
  }

  async updateConfig(tenantId, pluginId, config, currentUserId) {
    const updated = await pluginRepository.updatePluginConfig(tenantId, pluginId, config);
    eventBus.publish('plugin:config_updated', { tenantId, pluginId, updatedBy: currentUserId });
    return updated;
  }
}

module.exports = new PluginService();
