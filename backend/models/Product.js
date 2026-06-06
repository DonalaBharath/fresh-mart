const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true, enum: ['vegetable', 'fruit'] },
  imageUrl: { type: String, required: [true, 'Product image is required'], trim: true },
  availability: { type: String, enum: ['In Stock', 'Out of Stock'], default: 'In Stock' },
  rating: { type: Number, default: 4.7 },
  reviewsCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
