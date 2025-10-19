const mongoose = require('mongoose');

const deliveryAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Home'
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true,
    default: ''
  },
  landmark: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
deliveryAddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('DeliveryAddress', deliveryAddressSchema);