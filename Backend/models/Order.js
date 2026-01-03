const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    unit: {
        type: String,
        required: true,
        default: 'item'
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    deliveryType: {
        type: String,
        enum: ['pickup', 'home_delivery'],
        default: 'pickup'
    },
    farmerAadhar: {
        type: String,
        required: true
    },
    farmerName: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerMobile: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'delivery', 'rejected', 'completed', 'payment_pending', 'payment_completed'],
        default: 'pending'
    },
    deliveryLocation: {
        type: String,
        default: ''
    },
    customerLocation: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    farmerLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    date: {
        type: String,
        required: true
    },
    confirmedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    paymentQRCode: {
        type: String,
        default: ''
    },
    paymentExpiry: {
        type: Date
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'expired'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);