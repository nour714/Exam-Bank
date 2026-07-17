const questionService = require('./question.service');
const { createQuestionSchema, paginationQuery } = require('./question.validator');

class QuestionController {
  async createQuestion(req, res) {
    const data = createQuestionSchema.parse(req.body);
    const question = await questionService.createQuestion(req.tenantId, data, req.user.userId);
    res.status(201).json({ success: true, data: question });
  }

  async listQuestions(req, res) {
    const options = paginationQuery.parse(req.query);
    const result = await questionService.listQuestions(req.tenantId, options);
    res.status(200).json({ success: true, data: result });
  }
}

module.exports = new QuestionController();
