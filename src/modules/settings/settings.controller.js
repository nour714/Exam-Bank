const settingsService = require('./settings.service');
const { settingSchema, settingCategoryParam, settingIdParam } = require('./settings.validator');
const { z } = require('zod');

class SettingsController {
  async list(req, res) {
    const tenantId = req.tenantId || null;
    const settings = await settingsService.listAll(tenantId);

    res.status(200).json({
      success: true,
      data: settings,
    });
  }

  async getByCategory(req, res) {
    const { category } = settingCategoryParam.parse(req.params);
    const tenantId = req.tenantId || null;
    const settings = await settingsService.getByCategory(category, tenantId);

    res.status(200).json({
      success: true,
      data: settings,
    });
  }

  async set(req, res) {
    const validated = settingSchema.parse(req.body);
    const setting = await settingsService.set(validated);

    res.status(200).json({
      success: true,
      data: setting,
    });
  }

  async bulkSet(req, res) {
    const bulkSchema = z.array(settingSchema).min(1).max(100);
    const validated = bulkSchema.parse(req.body);
    const results = await settingsService.bulkSet(validated);

    res.status(200).json({
      success: true,
      data: results,
    });
  }

  async remove(req, res) {
    const { id } = settingIdParam.parse(req.params);
    await settingsService.remove(id);

    res.status(200).json({
      success: true,
      message: 'Setting deleted',
    });
  }
}

module.exports = new SettingsController();
