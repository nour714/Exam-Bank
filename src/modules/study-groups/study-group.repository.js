const { getPrismaClient } = require('../../shared/database');

class StudyGroupRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  async createGroup(tenantId, data, creatorUserId) {
    return this.prisma.studyGroup.create({
      data: {
        tenantId,
        ...data,
        members: {
          create: [{ userId: creatorUserId, role: 'ADMIN' }],
        },
      },
      include: { members: true },
    });
  }

  async getGroups(tenantId, userId) {
    // Returns groups the user is a member of
    return this.prisma.studyGroup.findMany({
      where: {
        tenantId,
        members: { some: { userId } },
      },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGroupById(groupId) {
    return this.prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } } },
    });
  }

  async joinGroup(groupId, userId, role = 'MEMBER') {
    return this.prisma.studyGroupMember.create({
      data: { groupId, userId, role },
    });
  }

  async leaveGroup(groupId, userId) {
    return this.prisma.studyGroupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
  }
}

module.exports = new StudyGroupRepository();
