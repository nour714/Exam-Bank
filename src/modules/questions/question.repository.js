const { getPrismaClient } = require('../../shared/database');

class QuestionRepository {
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
   * Create a question with choices in a transaction.
   */
  async createQuestion(data, choices = []) {
    return this.prisma.question.create({
      data: {
        ...data,
        choices: {
          create: choices,
        },
      },
      include: { choices: true },
    });
  }

  /**
   * Get questions with filtering and pagination.
   */
  async getQuestions(tenantId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where = { tenantId };
    if (options.subjectId) where.subjectId = options.subjectId;
    if (options.lessonId) where.lessonId = options.lessonId;
    if (options.type) where.type = options.type;
    if (options.difficulty) where.difficulty = options.difficulty;
    if (options.tags && options.tags.length > 0) {
      where.tags = { hasSome: options.tags };
    }

    const [items, total] = await Promise.all([
      this.prisma.question.findMany({ 
        where, 
        skip, 
        take: limit,
        include: { choices: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.question.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get a single question by ID.
   */
  async getQuestionById(id) {
    return this.prisma.question.findUnique({
      where: { id },
      include: { choices: true },
    });
  }
}

module.exports = new QuestionRepository();
