const engineRepository = require('./engine.repository');
const examRepository = require('../exams/exam.repository');
const GradingEngine = require('./grading.engine');
const { eventBus } = require('../../shared/events');
const { BadRequestError, NotFoundError } = require('../../shared/errors');

class EngineService {
  /**
   * Starts a new exam session for a user.
   */
  async startAttempt(tenantId, examId, userId, metadata) {
    // 1. Validate exam exists and is published
    const exam = await examRepository.getExamById(examId);
    if (!exam || exam.tenantId !== tenantId || !exam.isPublished) {
      throw new NotFoundError('Exam is not available');
    }

    // 2. Prevent multiple active attempts
    const active = await engineRepository.getActiveAttempt(tenantId, examId, userId);
    if (active) {
      return active; // Or throw error based on policy
    }

    // 3. Create attempt
    const attempt = await engineRepository.createAttempt(tenantId, examId, userId, metadata);

    // 4. Fire event
    eventBus.publish('attempt:started', { 
      attemptId: attempt.id, 
      examId, 
      userId, 
      tenantId 
    });

    return attempt;
  }

  /**
   * Fetch an attempt (with exam + questions + existing answers) so a client
   * can resume an in-progress session after a page refresh or reconnect.
   */
  async getAttempt(tenantId, attemptId, userId) {
    const attempt = await engineRepository.getAttemptById(attemptId);

    if (!attempt || attempt.tenantId !== tenantId || attempt.userId !== userId) {
      throw new NotFoundError('Attempt not found');
    }

    return attempt;
  }

  /**
   * Auto-save a single answer. Evaluates objective questions on the fly.
   */
  async saveAnswer(tenantId, attemptId, questionId, answerData, userId) {
    const attempt = await engineRepository.getAttemptById(attemptId);
    
    if (!attempt || attempt.tenantId !== tenantId || attempt.userId !== userId) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status !== 'STARTED') {
      throw new BadRequestError('Cannot modify a submitted exam');
    }

    // Find the specific question config within the exam
    const examQuestion = attempt.exam.questions.find(q => q.questionId === questionId);
    if (!examQuestion) {
      throw new BadRequestError('Question does not belong to this exam');
    }

    // Evaluate auto-grade logic
    const maxPoints = examQuestion.points ?? examQuestion.question.points;
    const grading = GradingEngine.evaluate(examQuestion.question, answerData, maxPoints);

    // Upsert answer
    const answer = await engineRepository.saveAnswer(attemptId, questionId, answerData, grading);

    eventBus.publish('attempt:answer_saved', { attemptId, questionId, userId });

    return answer;
  }

  /**
   * Finalize and submit the exam attempt.
   */
  async submitAttempt(tenantId, attemptId, userId, remainingSecs) {
    const attempt = await engineRepository.getAttemptById(attemptId);
    
    if (!attempt || attempt.tenantId !== tenantId || attempt.userId !== userId) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status !== 'STARTED') {
      throw new BadRequestError('Attempt is already submitted');
    }

    // Calculate preliminary total score
    let totalScore = 0;
    let needsManualReview = false;

    for (const answer of attempt.answers) {
      totalScore += answer.autoScore || 0;
      if (answer.isCorrect === null) {
        needsManualReview = true;
      }
    }

    // Determine new status
    const newStatus = needsManualReview ? 'SUBMITTED' : 'AUTO_GRADED';
    const passed = !needsManualReview ? (totalScore >= attempt.exam.passingScore) : null;

    const submitted = await engineRepository.submitAttempt(
      attemptId, 
      newStatus, 
      totalScore, 
      passed, 
      remainingSecs
    );

    eventBus.publish('attempt:submitted', { attemptId, userId, newStatus, totalScore });

    return submitted;
  }

  /**
   * Manual grading hook for instructors.
   */
  async reviewAnswer(tenantId, attemptId, answerId, manualScore, feedback, instructorId) {
    // In a full implementation, we'd verify the instructor's permissions here
    const updated = await engineRepository.updateManualGrade(answerId, manualScore, feedback);
    
    eventBus.publish('attempt:answer_reviewed', { attemptId, answerId, instructorId });
    return updated;
  }
}

module.exports = new EngineService();
