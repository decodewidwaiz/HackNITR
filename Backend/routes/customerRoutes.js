const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// Customer signup
router.post('/signup', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        
        // Remove password from response
        const customerResponse = customer.toObject();
        delete customerResponse.password;
        
        res.status(201).json(customerResponse);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mobile number already exists' });
        }
        res.status(400).json({ message: error.message });
    }
});

// Customer login
router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const customer = await Customer.findOne({ mobile });
        
        if (!customer || customer.password !== password) {
            return res.status(401).json({ message: 'Invalid mobile or password' });
        }
        
        // Remove password from response
        const customerResponse = customer.toObject();
        delete customerResponse.password;
        
        res.json(customerResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get customer orders
router.get('/:id/orders', async (req, res) => {
    try {
        const orders = await Order.find({ customerMobile: req.params.id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get customer by mobile (for order placement)
router.get('/mobile/:mobile', async (req, res) => {
    try {
        const customer = await Customer.findOne({ mobile: req.params.mobile });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Remove password from response
        const customerResponse = customer.toObject();
        delete customerResponse.password;
        
        res.json(customerResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;