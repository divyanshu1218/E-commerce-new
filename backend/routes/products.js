const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const { adminAuth } = require('../middleware/auth');

// Get all products (publicly accessible)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product (publicly accessible)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock, features } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ message: 'All fields are required except features' });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price) * 100, // Convert to paisa
      image: `/uploads/${req.file.filename}`,
      category,
      stock: parseInt(stock),
      features: features ? features.split(',').map(f => f.trim()) : []
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock, features } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ message: 'All fields are required except features' });
    }
    
    const updateData = {
      name,
      description,
      price: parseFloat(price) * 100,
      category,
      stock: parseInt(stock),
      features: features ? features.split(',').map(f => f.trim()) : []
    };

    // Update image only if a new file was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete product (admin only - soft delete)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 