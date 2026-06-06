const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  deliveryAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true, default: 30 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
