import { api } from '../http/api-client.js';

export const DashboardApiProvider = {
  async getSummary(cacheKey) {
    try {
      const res = await api.get('/analytics/tenant', { requestId: cacheKey });
      return res.data;
    } catch {
      return { totalUsers: 0, totalQuestions: 0, activeExams: 0 };
    }
  },

  async getActivity(cacheKey) {
    try {
      const res = await api.get('/analytics/activity', { requestId: cacheKey });
      return res.data;
    } catch {
      return [];
    }
  },

  async getPerformanceData(cacheKey) {
    try {
      const res = await api.get('/analytics/performance', { requestId: cacheKey });
      return res.data;
    } catch {
      return { accuracy: 0, streak: 0, xp: 0 };
    }
  }
};
