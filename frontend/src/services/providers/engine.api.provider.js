import { api } from '../http/api-client.js';

export const EngineApiProvider = {
  async startAttempt(examId, metadata = {}) {
    const res = await api.post('/engine/attempts', { examId, metadata });
    return res.data;
  },

  async getAttempt(attemptId) {
    const res = await api.get(`/engine/attempts/${attemptId}`);
    return res.data;
  },

  async saveAnswer(attemptId, questionId, answerData) {
    const res = await api.post(`/engine/attempts/${attemptId}/answers`, { questionId, answerData });
    return res.data;
  },

  async submitAttempt(attemptId, remainingSecs) {
    const res = await api.post(`/engine/attempts/${attemptId}/submit`, { remainingSecs });
    return res.data;
  }
};
