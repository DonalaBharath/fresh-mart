const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      category: req.body.category,
      availability: req.body.availability || 'In Stock',
      discount: Number(req.body.discount) || 0,
      featured: req.body.featured === 'true' || req.body.featured === true,
      imageUrl,
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, availability } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (availability) filter.availability = availability;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const isAdminRequest = req.user && req.user.role === 'admin';
    if (!isAdminRequest) {
      filter.availability = 'In Stock';
      filter.quantity = { $gt: 0 };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load products' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateFields = {
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined,
      discount: req.body.discount !== undefined ? Number(req.body.discount) : undefined,
      featured: req.body.featured === 'true' || req.body.featured === true,
    };

    if (req.file) {
      updateFields.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete product' });
  }
};
