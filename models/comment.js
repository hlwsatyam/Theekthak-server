// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

commentSchema.index({ reel: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);