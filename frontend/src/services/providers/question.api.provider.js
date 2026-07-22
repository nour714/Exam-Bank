import { api } from '../http/api-client.js';

export const QuestionApiProvider = {
  async search(criteria) {
    const res = await api.get('/questions', { params: criteria });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/questions/${id}`);
    return res.data;
  },

  async create(payload) {
    const res = await api.post('/questions', payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await api.put(`/questions/${id}`, payload);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },

  async restore(id) {
    try {
      const res = await api.post(`/questions/${id}/restore`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async permanentDelete(id) {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  }
};
