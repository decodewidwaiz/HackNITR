const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Revenue = require('../models/Revenue');
const Product = require('../models/Product');
const crypto = require('crypto');

// Generate unique QR code data
function generateQRCodeData(orderId, amount) {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return JSON.stringify({
    orderId: orderId.toString(),
    amount: amount,
    timestamp: timestamp,
    token: randomString
  });
}

// Get orders by farmer Aadhaar
router.get('/farmer/:aadhaar', async (req, res) => {
  try {
    const orders = await Order.find({ farmerAadhar: req.params.aadhaar })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by customer mobile
router.get('/customer/:mobile', async (req, res) => {
  try {
    const orders = await Order.find({ customerMobile: req.params.mobile })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order with delivery options
router.post('/', async (req, res) => {
  try {
    const { 
      productId, 
      productName, 
      productPrice, 
      quantity = 1, 
      unit = 'item',
      farmerAadhar, 
      farmerName, 
      customerName, 
      customerMobile, 
      deliveryType = 'pickup',
      deliveryLocation = '',
      customerLocation = {},
      date 
    } = req.body;

    // Validate required fields
    if (!productId || !productName || !productPrice || !farmerAadhar || !farmerName || !customerName || !customerMobile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.quantity} ${product.unit} available` 
      });
    }

    // Calculate final amount with delivery charge
    let baseAmount = productPrice * quantity;
    let deliveryCharge = 0;
    let finalAmount = baseAmount;

    if (deliveryType === 'home_delivery') {
      deliveryCharge = baseAmount * 0.03; // 3% delivery charge
      finalAmount = baseAmount + deliveryCharge;
    }

    const order = new Order({
      productId,
      productName,
      productPrice,
      finalAmount,
      quantity,
      unit: unit || product.unit,
      farmerAadhar,
      farmerName,
      customerName,
      customerMobile,
      deliveryType,
      deliveryCharge,
      deliveryLocation,
      customerLocation: deliveryType === 'home_delivery' ? customerLocation : {},
      date: date || new Date().toLocaleDateString(),
      status: 'pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Farmer accepts order and generates QR code
router.post('/:id/accept', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    // Generate QR code data
    const qrCodeData = generateQRCodeData(order._id, order.finalAmount);
    const paymentExpiry = new Date(Date.now() + 60000); // Increased to 1 minute (60000 ms)

    // Update order status and payment info
    order.status = 'payment_pending';
    order.paymentQRCode = qrCodeData;
    order.paymentExpiry = paymentExpiry;
    order.paymentStatus = 'pending';
    order.confirmedAt = new Date();
    
    await order.save();

    res.json({
      order,
      qrCode: qrCodeData,
      paymentExpiry: paymentExpiry,
      message: 'Order accepted. QR code generated for payment. Valid for 1 minute.'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Farmer rejects order with reason
router.post('/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: rejectionReason
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      order,
      message: 'Order rejected successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process payment (user confirms payment)
router.post('/:id/process-payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'payment_pending') {
      return res.status(400).json({ message: 'Payment not required or already processed' });
    }

    // Check if payment QR code is expired (1 minute expiry)
    if (order.paymentExpiry && new Date() > order.paymentExpiry) {
      order.paymentStatus = 'expired';
      order.status = 'pending'; // Reset to pending for new payment attempt
      await order.save();
      return res.status(400).json({ 
        message: 'Payment QR code expired. QR codes are valid for 1 minute only.' 
      });
    }

    // Update payment status and order status
    order.paymentStatus = 'completed';
    order.status = order.deliveryType === 'home_delivery' ? 'delivery' : 'confirmed';
    order.paymentCompletedAt = new Date();
    
    await order.save();

    // Calculate total amount including quantity and delivery charge
    const totalAmount = (order.productPrice * order.quantity) + (order.deliveryCharge || 0);

    // Create revenue record for farmer
    const revenue = new Revenue({
      farmerAadhar: order.farmerAadhar,
      farmerName: order.farmerName,
      orderId: order._id,
      productName: order.productName,
      amount: totalAmount, // Total amount including delivery
      baseAmount: order.productPrice * order.quantity, // Base amount without delivery
      deliveryCharge: order.deliveryCharge || 0,
      deliveryType: order.deliveryType,
      quantity: order.quantity,
      unit: order.unit,
      date: new Date().toLocaleDateString(),
      paymentMethod: 'qr_payment',
      paymentCompletedAt: new Date()
    });
    await revenue.save();

    // Update product quantity (reduce available quantity)
    await Product.findByIdAndUpdate(
      order.productId,
      { $inc: { quantity: -order.quantity } }
    );

    res.json({
      order,
      revenue,
      message: 'Payment completed successfully and amount credited to farmer revenue'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment status
router.get('/:id/payment-status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isQRValid = order.paymentExpiry && new Date() < order.paymentExpiry;
    const revenue = await Revenue.findOne({ orderId: order._id });
    
    // Calculate time remaining in seconds
    let timeRemaining = 0;
    if (order.paymentExpiry && isQRValid) {
      timeRemaining = Math.max(0, Math.floor((order.paymentExpiry - new Date()) / 1000));
    }

    res.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      isQRValid: isQRValid,
      qrCode: isQRValid ? order.paymentQRCode : null,
      paymentExpiry: order.paymentExpiry,
      timeRemaining: timeRemaining, // Time remaining in seconds
      finalAmount: order.finalAmount,
      revenueCreated: !!revenue,
      revenueAmount: revenue ? revenue.amount : 0,
      message: isQRValid ? `QR code valid for ${timeRemaining} seconds` : 'QR code expired'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Regenerate QR code with new expiry (1 minute)
router.post('/:id/regenerate-qr', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'payment_pending') {
      return res.status(400).json({ message: 'Cannot regenerate QR for this order status' });
    }

    // Generate new QR code data
    const qrCodeData = generateQRCodeData(order._id, order.finalAmount);
    const paymentExpiry = new Date(Date.now() + 60000); // 1 minute expiry

    // Update payment info with new expiry
    order.paymentQRCode = qrCodeData;
    order.paymentExpiry = paymentExpiry;
    order.paymentStatus = 'pending';
    
    await order.save();

    res.json({
      order,
      qrCode: qrCodeData,
      paymentExpiry: paymentExpiry,
      message: 'New QR code generated. Valid for 1 minute.'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update farmer location for pickup
router.patch('/:id/farmer-location', async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    
    if (!lat || !lng || !address) {
      return res.status(400).json({ message: 'Location coordinates and address are required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        farmerLocation: { lat, lng, address },
        deliveryLocation: address // Also update delivery location
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      order,
      message: 'Farmer location updated successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete order
router.post('/:id/complete', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;