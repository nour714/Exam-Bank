import { api } from '../http/api-client.js';

export const StudyGroupsApiProvider = {
  async getMyGroups() {
    const res = await api.get('/study-groups');
    return res.data;
  },

  async getPublicGroups() {
    const res = await api.get('/study-groups/discover');
    return res.data;
  },

  async createGroup(payload) {
    const res = await api.post('/study-groups', payload);
    return res.data;
  },

  async joinGroup(groupId) {
    const res = await api.post(`/study-groups/${groupId}/join`);
    return res.data;
  },

  async joinByCode(inviteCode) {
    const res = await api.post('/study-groups/join-by-code', { inviteCode });
    return res.data;
  }
};
