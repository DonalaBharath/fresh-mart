const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const validateRequest = require('../middleware/validateRequest');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateObjectId = require('../middleware/validateObjectId');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many admin operations. Try again later.',
});

router.get('/', productController.getProducts);
router.get('/admin', protect, admin, productController.getProducts);
router.get('/:id', validateObjectId, productController.getProduct);

router.post(
  '/',
  protect,
  admin,
  adminLimiter,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a valid number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a valid number'),
    body('category').isIn(['vegetable', 'fruit']).withMessage('Category must be vegetable or fruit'),
  ],
  validateRequest,
  productController.createProduct
);

router.put('/:id', protect, admin, adminLimiter, validateObjectId, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, admin, adminLimiter, validateObjectId, productController.deleteProduct);

module.exports = router;
