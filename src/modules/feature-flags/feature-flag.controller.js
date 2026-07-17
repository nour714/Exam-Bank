const featureFlagService = require('./feature-flag.service');
const { featureFlagSchema, featureFlagIdParam } = require('./feature-flag.validator');

class FeatureFlagController {
  async list(req, res) {
    const tenantId = req.tenantId || null;
    const flags = await featureFlagService.listAll(tenantId);

    res.status(200).json({
      success: true,
      data: flags,
    });
  }

  async check(req, res) {
    const { key } = req.params;
    const tenantId = req.tenantId || null;
    const enabled = await featureFlagService.isEnabled(key, tenantId);

    res.status(200).json({
      success: true,
      data: { key, enabled },
    });
  }

  async upsert(req, res) {
    const validated = featureFlagSchema.parse(req.body);
    const flag = await featureFlagService.upsert(validated);

    res.status(200).json({
      success: true,
      data: flag,
    });
  }

  async remove(req, res) {
    const { id } = featureFlagIdParam.parse(req.params);
    await featureFlagService.remove(id);

    res.status(200).json({
      success: true,
      message: 'Feature flag deleted',
    });
  }
}

module.exports = new FeatureFlagController();
