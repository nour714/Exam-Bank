const curriculumService = require('./curriculum.service');
const { 
  createCurriculumSchema, 
  createGradeSchema, 
  createSubjectSchema, 
  createUnitSchema, 
  createLessonSchema, 
  paginationQuery 
} = require('./curriculum.validator');

class CurriculumController {
  // ─── Curriculum ──────────────────────────────────────────

  async createCurriculum(req, res) {
    const data = createCurriculumSchema.parse(req.body);
    const curriculum = await curriculumService.createCurriculum(req.tenantId, data, req.user.userId);
    res.status(201).json({ success: true, data: curriculum });
  }

  async listCurriculums(req, res) {
    const options = paginationQuery.parse(req.query);
    const result = await curriculumService.listCurriculums(req.tenantId, options);
    res.status(200).json({ success: true, data: result });
  }

  // ─── Grade ───────────────────────────────────────────────

  async createGrade(req, res) {
    const data = createGradeSchema.parse(req.body);
    const grade = await curriculumService.createGrade(data, req.user.userId);
    res.status(201).json({ success: true, data: grade });
  }

  async listGrades(req, res) {
    const result = await curriculumService.listGrades(req.params.curriculumId);
    res.status(200).json({ success: true, data: result });
  }

  // ─── Subject ─────────────────────────────────────────────

  async createSubject(req, res) {
    const data = createSubjectSchema.parse(req.body);
    const subject = await curriculumService.createSubject(req.tenantId, data, req.user.userId);
    res.status(201).json({ success: true, data: subject });
  }

  async listSubjects(req, res) {
    const options = paginationQuery.parse(req.query);
    const result = await curriculumService.listSubjects(req.tenantId, options);
    res.status(200).json({ success: true, data: result });
  }

  // ─── Unit ────────────────────────────────────────────────

  async createUnit(req, res) {
    const data = createUnitSchema.parse(req.body);
    const unit = await curriculumService.createUnit(data, req.user.userId);
    res.status(201).json({ success: true, data: unit });
  }

  async listUnits(req, res) {
    const result = await curriculumService.listUnits(req.params.subjectId);
    res.status(200).json({ success: true, data: result });
  }

  // ─── Lesson ──────────────────────────────────────────────

  async createLesson(req, res) {
    const data = createLessonSchema.parse(req.body);
    const lesson = await curriculumService.createLesson(data, req.user.userId);
    res.status(201).json({ success: true, data: lesson });
  }
}

module.exports = new CurriculumController();
