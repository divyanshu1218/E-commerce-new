const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth'); // Import auth and adminAuth middleware

// Create new order (accessible to authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, paymentMethod } = req.body;
    const customer = { 
      name: req.user.name, 
      email: req.user.email 
    }; // Get customer from authenticated user

    // Validate items and check stock
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    const order = new Order({
      customer,
      items,
      total,
      paymentMethod
    });

    const newOrder = await order.save();

    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID (authenticated users can view their own orders, admin can view any)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow user to view their own order unless they are admin
    if (req.user.role !== 'admin' && order.customer.email !== req.user.email) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment details (admin only - or handled by payment gateway callbacks)
router.patch('/:id/payment', adminAuth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, paypalOrderId, paymentStatus } = req.body;
    
    const updateData = {
      paymentStatus: paymentStatus || 'completed'
    };

    if (razorpayOrderId) updateData.razorpayOrderId = razorpayOrderId;
    if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId;
    if (paypalOrderId) updateData.paypalOrderId = paypalOrderId;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 