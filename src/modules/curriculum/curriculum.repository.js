const { getPrismaClient } = require('../../shared/database');

class CurriculumRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  // ─── Curriculum ──────────────────────────────────────────

  async createCurriculum(data) {
    return this.prisma.curriculum.create({ data });
  }

  async getCurriculums(tenantId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where = { tenantId };
    if (options.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.curriculum.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.curriculum.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Grade ───────────────────────────────────────────────

  async createGrade(data) {
    return this.prisma.grade.create({ data });
  }

  async getGradesByCurriculum(curriculumId) {
    return this.prisma.grade.findMany({
      where: { curriculumId },
      orderBy: { order: 'asc' },
    });
  }

  // ─── Subject ─────────────────────────────────────────────

  async createSubject(data) {
    return this.prisma.subject.create({ data });
  }

  async getSubjects(tenantId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where = { tenantId };
    if (options.curriculumId) where.curriculumId = options.curriculumId;
    if (options.gradeId) where.gradeId = options.gradeId;
    if (options.search) where.name = { contains: options.search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.subject.findMany({ 
        where, 
        skip, 
        take: limit, 
        include: { grade: true, curriculum: true },
        orderBy: { createdAt: 'desc' } 
      }),
      this.prisma.subject.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Unit ────────────────────────────────────────────────

  async createUnit(data) {
    return this.prisma.unit.create({ data });
  }

  async getUnitsBySubject(subjectId) {
    return this.prisma.unit.findMany({
      where: { subjectId },
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } }
    });
  }

  // ─── Lesson ──────────────────────────────────────────────

  async createLesson(data) {
    return this.prisma.lesson.create({ data });
  }
}

module.exports = new CurriculumRepository();
