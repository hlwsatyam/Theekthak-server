const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const openingHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM
  },
  close: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  closed: {
    type: Boolean,
    default: false
  }
});

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String
  },

  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    pincode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },

  // ✅ Add correct GeoJSON field for geospatial queries
  geo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  categories: [{ type: String, required: true }],
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },

  openingHours: {
    monday: openingHoursSchema,
    tuesday: openingHoursSchema,
    wednesday: openingHoursSchema,
    thursday: openingHoursSchema,
    friday: openingHoursSchema,
    saturday: openingHoursSchema,
    sunday: openingHoursSchema
  },

  businessType: {
    type: String,
    enum: ['retail', 'wholesale', 'manufacturer', 'service', 'online', 'other'],
    required: true
  },

  taxInfo: {
    gstin: String,
    pan: String
  },

  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },

  isActive: { type: Boolean, default: true },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

// ✅ Geo index for nearby search
storeSchema.index({ geo: '2dsphere' });
storeSchema.index({ 'location.city': 1 });
storeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Store', storeSchema);
