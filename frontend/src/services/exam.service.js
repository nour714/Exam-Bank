import { api } from './http/api-client.js';

/**
 * Exam Service.
 * Business-level API wrapper for exam operations.
 */
export const examService = {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return api.get(`/exams${query ? `?${query}` : ''}`);
  },

  getById(id) {
    return api.get(`/exams/${id}`);
  },

  create(data) {
    return api.post('/exams', data);
  },

  update(id, data) {
    return api.patch(`/exams/${id}`, data);
  },

  delete(id) {
    return api.delete(`/exams/${id}`);
  },

  // Engine
  startAttempt(examId) {
    return api.post(`/engine/exams/${examId}/start`);
  },

  submitAnswer(attemptId, questionId, answer) {
    return api.post(`/engine/attempts/${attemptId}/answers`, { questionId, answer });
  },

  submitExam(attemptId) {
    return api.post(`/engine/attempts/${attemptId}/submit`);
  },

  getResults(attemptId) {
    return api.get(`/engine/attempts/${attemptId}/results`);
  },
};
