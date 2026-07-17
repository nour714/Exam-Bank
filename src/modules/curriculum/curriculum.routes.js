const { Router } = require('express');
const controller = require('./curriculum.controller');
const { authenticate, authorize } = require('../../shared/middlewares');
const { ROLES } = require('../../shared/constants');

const router = Router();

// Protect all routes
router.use(authenticate);

// ─── Curriculum ──────────────────────────────────────────
router.get('/', controller.listCurriculums);
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.createCurriculum);

// ─── Grades ──────────────────────────────────────────────
router.get('/:curriculumId/grades', controller.listGrades);
router.post('/grades', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.createGrade);

// ─── Subjects ────────────────────────────────────────────
router.get('/subjects', controller.listSubjects);
router.post('/subjects', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), controller.createSubject);

// ─── Units ───────────────────────────────────────────────
router.get('/subjects/:subjectId/units', controller.listUnits);
router.post('/units', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), controller.createUnit);

// ─── Lessons ─────────────────────────────────────────────
router.post('/lessons', authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER), controller.createLesson);

module.exports = router;
