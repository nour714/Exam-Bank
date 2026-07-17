const questionRepository = require('./question.repository');
const { eventBus } = require('../../shared/events');
const { BadRequestError } = require('../../shared/errors');

class QuestionService {
  async createQuestion(tenantId, data, currentUserId) {
    // Validate based on type (business logic)
    const { choices, ...questionData } = data;

    if (data.type === 'MULTIPLE_CHOICE' && (!choices || choices.length < 2)) {
      throw new BadRequestError('Multiple choice questions require at least 2 choices.');
    }

    if (data.type === 'TRUE_FALSE' && (!choices || choices.length !== 2)) {
      throw new BadRequestError('True/False questions must have exactly 2 choices.');
    }

    const question = await questionRepository.createQuestion({
      tenantId,
      ...questionData,
    }, choices);

    eventBus.publish('question:created', { id: question.id, tenantId, subjectId: question.subjectId, createdBy: currentUserId });

    return question;
  }

  async listQuestions(tenantId, options) {
    return questionRepository.getQuestions(tenantId, options);
  }
}

module.exports = new QuestionService();
