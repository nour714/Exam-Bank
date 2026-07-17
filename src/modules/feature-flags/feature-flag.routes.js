const { Router } = require('express');
const controller = require('./feature-flag.controller');

const router = Router();

router.get('/', controller.list);
router.get('/:key', controller.check);
router.put('/', controller.upsert);
router.delete('/:id', controller.remove);

module.exports = router;
