let provider = null;

export function setStudyGroupsProvider(p) {
  provider = p;
}

export const studyGroupsService = {
  async getMyGroups() {
    if (!provider) throw new Error('[StudyGroupsService] No provider set.');
    return provider.getMyGroups();
  },

  async getPublicGroups() {
    if (!provider) throw new Error('[StudyGroupsService] No provider set.');
    return provider.getPublicGroups();
  },

  async createGroup(payload) {
    if (!provider) throw new Error('[StudyGroupsService] No provider set.');
    return provider.createGroup(payload);
  },

  async joinGroup(id) {
    if (!provider) throw new Error('[StudyGroupsService] No provider set.');
    return provider.joinGroup(id);
  },

  async joinByCode(inviteCode) {
    if (!provider) throw new Error('[StudyGroupsService] No provider set.');
    return provider.joinByCode(inviteCode);
  }
};
