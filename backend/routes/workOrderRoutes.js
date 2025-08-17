
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createWorkOrder, updateWorkOrder, listWorkOrders } = require('../controllers/workOrderController');

const router = express.Router();
router.use(protect);

router.post('/', createWorkOrder);
router.get('/', listWorkOrders);
router.put('/:id', updateWorkOrder);
router.patch('/:id', updateWorkOrder);

module.exports = router;
