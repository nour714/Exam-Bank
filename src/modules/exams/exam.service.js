const examRepository = require('./exam.repository');
const { eventBus } = require('../../shared/events');
const { NotFoundError } = require('../../shared/errors');

class ExamService {
  async createExam(tenantId, data, currentUserId) {
    const { questions, ...examData } = data;
    
    const exam = await examRepository.createExam({
      tenantId,
      ...examData,
    }, questions);

    eventBus.publish('exam:created', { id: exam.id, tenantId, subjectId: exam.subjectId, createdBy: currentUserId });

    return exam;
  }

  async getExams(tenantId, options) {
    return examRepository.getExams(tenantId, options);
  }

  async getExamDetails(tenantId, id) {
    const exam = await examRepository.getExamById(id);
    if (!exam || exam.tenantId !== tenantId) {
      throw new NotFoundError('Exam not found');
    }
    return exam;
  }

  async publishExam(tenantId, id, currentUserId) {
    await this.getExamDetails(tenantId, id); // check existence and tenant match
    const exam = await examRepository.publishExam(id);
    
    eventBus.publish('exam:published', { id: exam.id, tenantId, publishedBy: currentUserId });
    
    return exam;
  }
}

module.exports = new ExamService();
