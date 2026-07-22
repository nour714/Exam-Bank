import { api } from '../http/api-client.js';

/**
 * Curriculum API Provider
 * Fetches curriculum data from the backend REST API.
 */
export const CurriculumApiProvider = {
  async getSubjects(cacheKey) {
    const res = await api.get('/curriculums/subjects', { requestId: cacheKey });
    return res.data;
  },
  
  async getUnits(cacheKey, subjectId) {
    const res = await api.get(`/curriculums/subjects/${subjectId}/units`, { requestId: cacheKey });
    return res.data;
  },

  async getLessons(cacheKey, unitId) {
    const res = await api.get(`/curriculums/units/${unitId}/lessons`, { requestId: cacheKey });
    return res.data;
  }
};
