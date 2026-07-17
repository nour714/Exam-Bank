const studyGroupService = require('./study-group.service');
const { z } = require('zod');

const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
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

  async getGroupDetails(req, res) {
    const groupId = z.string().uuid().parse(req.params.groupId);
    const details = await studyGroupService.getGroupDetails(groupId, req.user.userId);
    res.status(200).json({ success: true, data: details });
  }

  async joinGroup(req, res) {
    const groupId = z.string().uuid().parse(req.params.groupId);
    const member = await studyGroupService.joinGroup(req.tenantId, groupId, req.user.userId);
    res.status(200).json({ success: true, data: member });
  }
}

module.exports = new StudyGroupController();
