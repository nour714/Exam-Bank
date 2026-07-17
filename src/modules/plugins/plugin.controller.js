const pluginService = require('./plugin.service');
const { z } = require('zod');

class PluginController {
  async getMarketplace(req, res) {
    const plugins = await pluginService.getMarketplace();
    res.status(200).json({ success: true, data: plugins });
  }

  async getInstalled(req, res) {
    const installed = await pluginService.getInstalled(req.tenantId);
    res.status(200).json({ success: true, data: installed });
  }

  async install(req, res) {
    const pluginId = z.string().uuid().parse(req.params.pluginId);
    const config = z.record(z.any()).optional().parse(req.body.config);
    const result = await pluginService.installPlugin(req.tenantId, pluginId, config, req.user.userId);
    res.status(201).json({ success: true, data: result });
  }

  async uninstall(req, res) {
    const pluginId = z.string().uuid().parse(req.params.pluginId);
    await pluginService.uninstallPlugin(req.tenantId, pluginId, req.user.userId);
    res.status(200).json({ success: true });
  }

  async updateConfig(req, res) {
    const pluginId = z.string().uuid().parse(req.params.pluginId);
    const config = z.record(z.any()).parse(req.body.config);
    const result = await pluginService.updateConfig(req.tenantId, pluginId, config, req.user.userId);
    res.status(200).json({ success: true, data: result });
  }
}

module.exports = new PluginController();
