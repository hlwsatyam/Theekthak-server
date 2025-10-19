const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryAddress',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDelivery: Date,
  orderNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${Date.now()}${count}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);