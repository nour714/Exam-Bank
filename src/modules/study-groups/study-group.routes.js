const { Router } = require('express');
const controller = require('./study-group.controller');
const { authenticate } = require('../../shared/middlewares');

const router = Router();

router.use(authenticate);

router.get('/', controller.getGroups);
router.post('/', controller.createGroup);
router.get('/:groupId', controller.getGroupDetails);
router.post('/:groupId/join', controller.joinGroup);

module.exports = router;
