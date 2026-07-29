const studyGroupService = require('./study-group.service');
const { z } = require('zod');

const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

const joinByCodeSchema = z.object({
  inviteCode: z.string().min(4).max(20),
});

class StudyGroupController {
  async createGroup(req, res) {
    const data = createGroupSchema.parse(req.body);
    const group = await studyGroupService.createGroup(req.tenantId, data, req.user.userId);
    res.status(201).json({ success: true, data: group });
  }

  async getGroups(req, res) {
    const groups = await studyGroupService.getGroups(req.tenantId, req.user.userId);
    res.status(200).json({ success: true, data: groups });
  }

  async getPublicGroups(req, res) {
    const groups = await studyGroupService.getPublicGroups(req.tenantId, req.user.userId);
    res.status(200).json({ success: true, data: groups });
  }

  async joinByCode(req, res) {
    const { inviteCode } = joinByCodeSchema.parse(req.body);
    const result = await studyGroupService.joinByInviteCode(req.tenantId, inviteCode, req.user.userId);
    res.status(200).json({ success: true, data: result });
  }

  async getGroupDetails(req, res) {
    const groupId = z.string().uuid().parse(req.params.groupId);
    const details = await studyGroupService.getGroupDetails(req.tenantId, groupId, req.user.userId);
    res.status(200).json({ success: true, data: details });
  }

  async joinGroup(req, res) {
    const groupId = z.string().uuid().parse(req.params.groupId);
    const member = await studyGroupService.joinGroup(req.tenantId, groupId, req.user.userId);
    res.status(200).json({ success: true, data: member });
  }
}

module.exports = new StudyGroupController();
