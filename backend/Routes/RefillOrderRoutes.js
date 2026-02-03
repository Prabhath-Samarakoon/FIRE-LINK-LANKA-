const express = require('express');
const router = express.Router();
const ctrl = require('../Controllers/RefillOrderController');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/complete', ctrl.complete);

module.exports = router;
