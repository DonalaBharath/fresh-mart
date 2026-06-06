const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin, customer } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many admin order changes. Please try again later.',
});

router.post('/', protect, customer, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.put('/:id/status', protect, admin, adminLimiter, validateObjectId, orderController.updateOrderStatus);

module.exports = router;
