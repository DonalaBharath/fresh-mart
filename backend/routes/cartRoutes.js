const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const cartController = require('../controllers/cartController');
const validateRequest = require('../middleware/validateRequest');
const { protect, customer } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', protect, customer, cartController.getCart);
router.post(
  '/',
  protect,
  customer,
  [
    body('productId').isMongoId().withMessage('Valid productId is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  cartController.addCartItem
);
router.put(
  '/:productId',
  protect,
  customer,
  validateObjectId,
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  validateRequest,
  cartController.updateCartItem
);
router.delete('/:productId', protect, customer, validateObjectId, cartController.removeCartItem);

module.exports = router;
