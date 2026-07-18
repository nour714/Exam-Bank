import { api } from '../http/api-client.js';

export const DashboardApiProvider = {
  async getSummary(cacheKey) {
    const res = await api.get('/dashboard/summary', { requestId: cacheKey });
    return res.data;
  },

  async getActivity(cacheKey) {
    const res = await api.get('/dashboard/activity', { requestId: cacheKey });
    return res.data;
  },

  async getPerformanceData(cacheKey) {
    const res = await api.get('/dashboard/performance', { requestId: cacheKey });
    return res.data;
  }
};
