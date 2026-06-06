const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, subtotal, deliveryCharge, total, paymentMethod } = req.body;
    const order = await Order.create({
      customer: req.user._id,
      items,
      deliveryAddress,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod,
    });
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Unable to place order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { customer: req.user._id };
    const orders = await Order.find(filter).populate('customer', 'fullName email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status || order.status;
    await order.save();
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update order' });
  }
};
