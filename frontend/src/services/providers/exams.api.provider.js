import { api } from '../http/api-client.js';

export const ExamsApiProvider = {
  async getExams(params = {}) {
    const query = new URLSearchParams();
    if (params.subjectId) query.set('subjectId', params.subjectId);
    if (params.page) query.set('page', params.page);
    const qs = query.toString();
    const res = await api.get(`/exams${qs ? `?${qs}` : ''}`);
    // Backend returns { items, total, page, limit, totalPages }
    return res.data.items;
  },

  async getExamById(id) {
    const res = await api.get(`/exams/${id}`);
    return res.data;
  }
};
