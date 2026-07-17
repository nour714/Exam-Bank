const { getPrismaClient } = require('../../shared/database');

class ExamRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  async createExam(data, questionsData = []) {
    // Calculate total points from questions if not provided
    const totalPoints = data.totalPoints || questionsData.reduce((acc, q) => acc + (q.points || 1), 0);

    return this.prisma.exam.create({
      data: {
        ...data,
        totalPoints,
        questions: {
          create: questionsData.map((q, index) => ({
            questionId: q.questionId,
            order: q.order ?? index,
            points: q.points,
          })),
        },
      },
      include: { questions: { include: { question: true } } },
    });
  }

  async getExams(tenantId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where = { tenantId };
    if (options.subjectId) where.subjectId = options.subjectId;
    if (options.type) where.type = options.type;

    const [items, total] = await Promise.all([
      this.prisma.exam.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.exam.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getExamById(id) {
    return this.prisma.exam.findUnique({
      where: { id },
      include: { 
        questions: { 
          include: { 
            question: { include: { choices: true } } 
          },
          orderBy: { order: 'asc' }
        } 
      },
    });
  }

  async publishExam(id) {
    return this.prisma.exam.update({
      where: { id },
      data: { isPublished: true },
    });
  }
}

module.exports = new ExamRepository();
