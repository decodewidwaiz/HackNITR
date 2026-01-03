const express = require('express');
const router = express.Router();
const Revenue = require('../models/Revenue');

// Get revenue by farmer Aadhaar
router.get('/farmer/:aadhaar', async (req, res) => {
    try {
        const revenue = await Revenue.find({ farmerAadhar: req.params.aadhaar })
            .sort({ createdAt: -1 });
        
        // Calculate totals
        const totalRevenue = revenue.reduce((sum, rev) => sum + rev.amount, 0);
        
        const monthlyRevenue = revenue
            .filter(rev => {
                const revDate = new Date(rev.createdAt);
                const now = new Date();
                return revDate.getMonth() === now.getMonth() && 
                       revDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, rev) => sum + rev.amount, 0);
        
        const deliveryEarnings = revenue
            .filter(rev => rev.deliveryType === 'home_delivery')
            .reduce((sum, rev) => sum + rev.deliveryCharge, 0);

        res.json({
            transactions: revenue,
            totals: {
                totalRevenue,
                monthlyRevenue,
                totalTransactions: revenue.length,
                deliveryEarnings
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;