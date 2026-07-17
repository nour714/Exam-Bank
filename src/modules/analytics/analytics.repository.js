const { getPrismaClient } = require('../../shared/database');

/**
 * Analytics Read Model (CQRS Query side).
 * This repository circumvents standard ORM limits for complex analytics,
 * using raw SQL where necessary for high-performance aggregations.
 */
class AnalyticsRepository {
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
   * Get overall performance stats for a tenant.
   */
  async getTenantStats(tenantId) {
    // In a true CQRS system, this would query a dedicated read database (e.g. ElasticSearch or ClickHouse).
    // For now, we query Prisma but structure it purely as a read-model projection.
    const totalAttempts = await this.prisma.examAttempt.count({ where: { tenantId, status: { in: ['AUTO_GRADED', 'REVIEWED'] } } });
    
    // Using raw SQL for complex aggregation to prevent memory issues on millions of records.
    const result = await this.prisma.$queryRaw`
      SELECT 
        AVG(score) as avg_score,
        COUNT(CASE WHEN passed = true THEN 1 END) as passed_count
      FROM "ExamAttempt"
      WHERE "tenantId" = ${tenantId} AND status IN ('AUTO_GRADED', 'REVIEWED')
    `;

    return {
      totalAttempts,
      averageScore: result[0]?.avg_score || 0,
      passedCount: Number(result[0]?.passed_count) || 0,
    };
  }

  /**
   * Get question difficulty analytics (how often is a question answered incorrectly).
   */
  async getQuestionAnalytics(tenantId, questionId) {
    const result = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_answers,
        COUNT(CASE WHEN "isCorrect" = true THEN 1 END) as correct_answers,
        AVG("autoScore") as avg_score
      FROM "ExamAnswer" ea
      JOIN "ExamAttempt" eat ON eat.id = ea."attemptId"
      WHERE eat."tenantId" = ${tenantId} AND ea."questionId" = ${questionId}
    `;

    return {
      totalAnswers: Number(result[0]?.total_answers) || 0,
      correctAnswers: Number(result[0]?.correct_answers) || 0,
      averageScore: result[0]?.avg_score || 0,
    };
  }
}

module.exports = new AnalyticsRepository();
