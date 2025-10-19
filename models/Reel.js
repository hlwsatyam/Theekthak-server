const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
   
  },
  duration: {
    type: Number,
   
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['comedy', 'education', 'sports', 'music', 'dance', 'art', 'food', 'travel', 'fashion', 'beauty', 'fitness', 'other']
  },
  location: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public'
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowDuet: {
    type: Boolean,
    default: true
  },
  allowStitch: {
    type: Boolean,
    default: true
  },
  music: {
    title: String,
    artist: String,
    url: String
  },
  effects: [{
    name: String,
    intensity: Number
  }],
  filters: {
    type: String,
    default: 'normal'
  },
  stats: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 }
  },
  isSponsored: {
    type: Boolean,
    default: false
  },
  sponsorship: {
    brand: String,
    dealType: String,
    amount: Number
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number,
    bitrate: Number
  }
}, {
  timestamps: true
});

reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ category: 1 });
reelSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Reel', reelSchema);