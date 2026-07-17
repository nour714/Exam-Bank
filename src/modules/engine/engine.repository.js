const { getPrismaClient } = require('../../shared/database');

class EngineRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  /**
   * Start a new exam attempt.
   */
  async createAttempt(tenantId, examId, userId, metadata = {}) {
    return this.prisma.examAttempt.create({
      data: {
        tenantId,
        examId,
        userId,
        status: 'STARTED',
        metadata,
      },
    });
  }

  /**
   * Get an attempt by ID, including answers and the base exam config.
   */
  async getAttemptById(id) {
    return this.prisma.examAttempt.findUnique({
      where: { id },
      include: {
        exam: {
          include: { questions: { include: { question: { include: { choices: true } } } } },
        },
        answers: true,
      },
    });
  }

  /**
   * Find an active attempt for a user and exam.
   */
  async getActiveAttempt(tenantId, examId, userId) {
    return this.prisma.examAttempt.findFirst({
      where: {
        tenantId,
        examId,
        userId,
        status: 'STARTED',
      },
      include: { answers: true },
    });
  }

  /**
   * Save an answer to an attempt (upsert for auto-save capability).
   */
  async saveAnswer(attemptId, questionId, answerData, grading = {}) {
    return this.prisma.examAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      create: {
        attemptId,
        questionId,
        answerData,
        isCorrect: grading.isCorrect ?? null,
        autoScore: grading.autoScore ?? 0,
      },
      update: {
        answerData,
        isCorrect: grading.isCorrect ?? null,
        autoScore: grading.autoScore ?? 0,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Submit the attempt, transitioning status.
   */
  async submitAttempt(id, status, score, passed, remainingSecs) {
    return this.prisma.examAttempt.update({
      where: { id },
      data: {
        status,
        score,
        passed,
        remainingSecs,
        endedAt: new Date(),
      },
    });
  }

  /**
   * Manual grading update.
   */
  async updateManualGrade(answerId, manualScore, feedback) {
    return this.prisma.examAnswer.update({
      where: { id: answerId },
      data: { manualScore, feedback },
    });
  }

  /**
   * Mark attempt as fully reviewed.
   */
  async markReviewed(id, finalScore, passed) {
    return this.prisma.examAttempt.update({
      where: { id },
      data: { status: 'REVIEWED', score: finalScore, passed },
    });
  }
}

module.exports = new EngineRepository();
