const engineService = require('./engine.service');
const { startAttemptSchema, saveAnswerSchema, submitAttemptSchema, reviewAnswerSchema } = require('./engine.validator');
const { z } = require('zod');

class EngineController {
  async getAttempt(req, res) {
    const attemptId = z.string().uuid().parse(req.params.attemptId);
    const attempt = await engineService.getAttempt(req.tenantId, attemptId, req.user.userId);
    res.status(200).json({ success: true, data: attempt });
  }

  async startAttempt(req, res) {
    const data = startAttemptSchema.parse(req.body);
    const attempt = await engineService.startAttempt(req.tenantId, data.examId, req.user.userId, data.metadata);
    res.status(201).json({ success: true, data: attempt });
  }

  async saveAnswer(req, res) {
    const attemptId = z.string().uuid().parse(req.params.attemptId);
    const data = saveAnswerSchema.parse(req.body);
    
    const answer = await engineService.saveAnswer(
      req.tenantId, 
      attemptId, 
      data.questionId, 
      data.answerData, 
      req.user.userId
    );
    
    res.status(200).json({ success: true, data: answer });
  }

  async submitAttempt(req, res) {
    const attemptId = z.string().uuid().parse(req.params.attemptId);
    const data = submitAttemptSchema.parse(req.body);
    
    const attempt = await engineService.submitAttempt(
      req.tenantId, 
      attemptId, 
      req.user.userId, 
      data.remainingSecs
    );
    
    res.status(200).json({ success: true, data: attempt });
  }

  async reviewAnswer(req, res) {
    const attemptId = z.string().uuid().parse(req.params.attemptId);
    const answerId = z.string().uuid().parse(req.params.answerId);
    const data = reviewAnswerSchema.parse(req.body);

    const updated = await engineService.reviewAnswer(
      req.tenantId,
      attemptId,
      answerId,
      data.manualScore,
      data.feedback,
      req.user.userId
    );

    res.status(200).json({ success: true, data: updated });
  }
}

module.exports = new EngineController();
