const examService = require('./exam.service');
const { createExamSchema, paginationQuery } = require('./exam.validator');
const { z } = require('zod');

class ExamController {
  async createExam(req, res) {
    const data = createExamSchema.parse(req.body);
    const exam = await examService.createExam(req.tenantId, data, req.user.userId);
    res.status(201).json({ success: true, data: exam });
  }

  async listExams(req, res) {
    const options = paginationQuery.parse(req.query);
    const result = await examService.getExams(req.tenantId, options);
    res.status(200).json({ success: true, data: result });
  }

  async getExamDetails(req, res) {
    const id = z.string().uuid().parse(req.params.id);
    const exam = await examService.getExamDetails(req.tenantId, id);
    res.status(200).json({ success: true, data: exam });
  }

  async publishExam(req, res) {
    const id = z.string().uuid().parse(req.params.id);
    await examService.publishExam(req.tenantId, id, req.user.userId);
    res.status(200).json({ success: true, message: req.t('exam.published') });
  }
}

module.exports = new ExamController();
