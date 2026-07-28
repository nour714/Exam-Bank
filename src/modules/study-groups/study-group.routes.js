const { Router } = require('express');
const controller = require('./study-group.controller');
const { authenticate } = require('../../shared/middlewares');

const router = Router();

router.use(authenticate);

router.get('/', controller.getGroups);
router.get('/discover', controller.getPublicGroups);
router.post('/', controller.createGroup);
router.post('/join-by-code', controller.joinByCode);
router.get('/:groupId', controller.getGroupDetails);
router.post('/:groupId/join', controller.joinGroup);

module.exports = router;
