const studyGroupRepository = require('./study-group.repository');
const { eventBus } = require('../../shared/events');
const crypto = require('crypto');

class StudyGroupService {
  async createGroup(tenantId, data, currentUserId) {
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // E.g., 8A3F9B2C
    const group = await studyGroupRepository.createGroup(tenantId, { ...data, inviteCode }, currentUserId);
    eventBus.publish('study_group:created', { groupId: group.id, tenantId, createdBy: currentUserId });
    return group;
  }

  async getGroups(tenantId, userId) {
    return studyGroupRepository.getGroups(tenantId, userId);
  }

  async getPublicGroups(tenantId, userId) {
    return studyGroupRepository.getPublicGroups(tenantId, userId);
  }

  async joinByInviteCode(tenantId, inviteCode, userId) {
    const group = await studyGroupRepository.findByInviteCode(inviteCode, tenantId);
    if (!group) {
      const { NotFoundError } = require('../../shared/errors');
      throw new NotFoundError('Invalid invite code');
    }
    const member = await studyGroupRepository.joinGroup(group.id, userId);
    eventBus.publish('study_group:member_joined', { groupId: group.id, userId, tenantId });
    return { group, member };
  }

  async getGroupDetails(groupId, userId) {
    // In production, ensure the user is a member of the group before returning details
    return studyGroupRepository.getGroupById(groupId);
  }

  async joinGroup(tenantId, groupId, userId) {
    const member = await studyGroupRepository.joinGroup(groupId, userId);
    eventBus.publish('study_group:member_joined', { groupId, userId, tenantId });
    return member;
  }
}

module.exports = new StudyGroupService();
