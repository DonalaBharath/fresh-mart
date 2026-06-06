const Product = require('../models/Product');
const User = require('../models/User');

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json({ cart: user.cart || [] });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load cart' });
  }
};

exports.addCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const requestedQuantity = Math.max(Number(quantity), 1);
    const user = await User.findById(req.user._id);
    const existing = user.cart.find((item) => item.product.toString() === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + requestedQuantity, product.quantity);
    } else {
      user.cart.push({ product: productId, quantity: requestedQuantity });
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.json({ cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: 'Unable to add to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const requestedQuantity = Math.max(Number(quantity), 1);
    const user = await User.findById(req.user._id);
    const item = user.cart.find((item) => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    item.quantity = requestedQuantity;
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.json({ cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update cart item' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.json({ cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: 'Unable to remove cart item' });
  }
};
