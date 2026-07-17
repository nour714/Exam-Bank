const analyticsRepository = require('./analytics.repository');

class AnalyticsController {
  async getTenantStats(req, res) {
    const stats = await analyticsRepository.getTenantStats(req.tenantId);
    res.status(200).json({ success: true, data: stats });
  }

  async getQuestionAnalytics(req, res) {
    const { questionId } = req.params;
    const analytics = await analyticsRepository.getQuestionAnalytics(req.tenantId, questionId);
    res.status(200).json({ success: true, data: analytics });
  }
}

module.exports = new AnalyticsController();
