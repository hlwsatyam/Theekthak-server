const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    },
    trim: true
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    thumbnail: String
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'location', 'post_share'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  delivered: {
    type: Boolean,
    default: false
  },



  
  // Optional reply reference
  repliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  pending: { // true if first message waiting for reply
    type: Boolean,
    default: false
  },
  groupName: String,
  groupPhoto: String,
  groupAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mutedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  typingUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };
