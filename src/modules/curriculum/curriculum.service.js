const curriculumRepository = require('./curriculum.repository');
const { eventBus } = require('../../shared/events');

class CurriculumService {
  async createCurriculum(tenantId, data, currentUserId) {
    const curriculum = await curriculumRepository.createCurriculum({
      tenantId,
      ...data,
    });
    eventBus.publish('curriculum:created', { id: curriculum.id, tenantId, createdBy: currentUserId });
    return curriculum;
  }

  async listCurriculums(tenantId, options) {
    return curriculumRepository.getCurriculums(tenantId, options);
  }

  async createGrade(data, currentUserId) {
    const grade = await curriculumRepository.createGrade(data);
    eventBus.publish('grade:created', { id: grade.id, curriculumId: grade.curriculumId, createdBy: currentUserId });
    return grade;
  }

  async listGrades(curriculumId) {
    return curriculumRepository.getGradesByCurriculum(curriculumId);
  }

  async createSubject(tenantId, data, currentUserId) {
    const subject = await curriculumRepository.createSubject({
      tenantId,
      ...data,
    });
    eventBus.publish('subject:created', { id: subject.id, tenantId, createdBy: currentUserId });
    return subject;
  }

  async listSubjects(tenantId, options) {
    return curriculumRepository.getSubjects(tenantId, options);
  }

  async createUnit(data, currentUserId) {
    const unit = await curriculumRepository.createUnit(data);
    eventBus.publish('unit:created', { id: unit.id, subjectId: unit.subjectId, createdBy: currentUserId });
    return unit;
  }

  async listUnits(subjectId) {
    return curriculumRepository.getUnitsBySubject(subjectId);
  }

  async listLessons(unitId) {
    return curriculumRepository.getLessonsByUnit(unitId);
  }

  async createLesson(data, currentUserId) {
    const lesson = await curriculumRepository.createLesson(data);
    eventBus.publish('lesson:created', { id: lesson.id, unitId: lesson.unitId, createdBy: currentUserId });
    return lesson;
  }
}

module.exports = new CurriculumService();
