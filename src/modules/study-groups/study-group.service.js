const studyGroupRepository = require('./study-group.repository');
const { eventBus } = require('../../shared/events');
const { NotFoundError, ForbiddenError } = require('../../shared/errors');
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
    // findByInviteCode already filters by tenantId — safe
    const group = await studyGroupRepository.findByInviteCode(inviteCode, tenantId);
    if (!group) {
      throw new NotFoundError('Invalid invite code');
    }
    const member = await studyGroupRepository.joinGroup(group.id, userId);
    eventBus.publish('study_group:member_joined', { groupId: group.id, userId, tenantId });
    return { group, member };
  }

  async getGroupDetails(tenantId, groupId, userId) {
    const group = await studyGroupRepository.getGroupById(groupId);
    if (!group || group.tenantId !== tenantId) {
      throw new NotFoundError('Study group not found');
    }
    const isMember = group.members.some(m => m.userId === userId);
    if (group.isPrivate && !isMember) {
      throw new ForbiddenError('Access denied to private group');
    }
    return group;
  }

  async joinGroup(tenantId, groupId, userId) {
    // Verify the group exists and belongs to the same tenant before allowing join
    const group = await studyGroupRepository.getGroupById(groupId);
    if (!group || group.tenantId !== tenantId) {
      throw new NotFoundError('Study group not found');
    }
    const member = await studyGroupRepository.joinGroup(groupId, userId);
    eventBus.publish('study_group:member_joined', { groupId, userId, tenantId });
    return member;
  }
}

module.exports = new StudyGroupService();
