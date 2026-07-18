import { api } from '../http/api-client.js';

/**
 * Curriculum API Provider
 * Fetches curriculum data from the backend REST API.
 */
export const CurriculumApiProvider = {
  async getSubjects(cacheKey) {
    const res = await api.get('/curriculum/subjects', { requestId: cacheKey });
    return res.data;
  },
  
  async getUnits(cacheKey, subjectId) {
    const res = await api.get(`/curriculum/subjects/${subjectId}/units`, { requestId: cacheKey });
    return res.data;
  },

  async getLessons(cacheKey, unitId) {
    const res = await api.get(`/curriculum/units/${unitId}/lessons`, { requestId: cacheKey });
    return res.data;
  }
};
