const { Router } = require('express');
const controller = require('./settings.controller');

const router = Router();

router.get('/', controller.list);
router.get('/category/:category', controller.getByCategory);
router.put('/', controller.set);
router.put('/bulk', controller.bulkSet);
router.delete('/:id', controller.remove);

module.exports = router;
