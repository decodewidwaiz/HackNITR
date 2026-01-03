const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  aadhaar: { type: String, required: true },
  farmerName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }, 
  unit: { type: String, required: true },
  category: { type: String, required: true }, 
  location: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);