// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Basic Post Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Content
  caption: {
    type: String,
    maxlength: 2200,
    trim: true
  },
  
  // Media - Support for multiple images/videos
  images: [{
    url: {
      type: String,
      required: true
    },
    width: Number,
    height: Number,
    aspectRatio: Number,
    thumbnail: String, // For faster loading
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Video specific fields
  video: {
    url: String,
    thumbnail: String,
    duration: Number, // in seconds
    width: Number,
    height: Number,
    aspectRatio: Number,
    format: String // mp4, mov, etc.
  },
  
  // Type of post
  type: {
    type: String,
    enum: ['image', 'video', 'carousel', 'reel'],
    default: 'image'
  },
  
  // Location
  location: {
    name: String,
    lat: Number,
    lng: Number,
    address: String,
    placeId: String
  },
  
  // Tags and Mentions
  taggedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    x: Number, // Position coordinates for image
    y: Number
  }],
  
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  hashtags: [String],
  
  // Engagement Metrics
  stats: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    }
  },
  
  // User interaction status (for current user)
  userInteractions: {
    hasLiked: {
      type: Boolean,
      default: false
    },
    hasSaved: {
      type: Boolean,
      default: false
    },
    hasShared: {
      type: Boolean,
      default: false
    }
  },
  
  // Comments
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  // Latest comments for quick access (denormalized)
  previewComments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: Number,
      default: 0
    },
    hasLiked: {
      type: Boolean,
      default: false
    }
  }],
  
  // Privacy and Visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers', 'close_friends'],
    default: 'public'
  },
  
  // Archiving and Deletion
  isArchived: {
    type: Boolean,
    default: false
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  
  // Scheduling
  scheduledAt: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  // Product Tagging (for shopping)
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    x: Number,
    y: Number,
    price: Number,
    title: String
  }],
  
  // Music (for Reels)
  music: {
    trackId: String,
    title: String,
    artist: String,
    album: String,
    startTime: Number, // Start time in seconds
    duration: Number, // Duration in seconds
    url: String
  },
  
  // Reel specific fields
  reel: {
    duration: Number,
    audioMuted: {
      type: Boolean,
      default: false
    },
    allowDuet: {
      type: Boolean,
      default: true
    },
    allowStitch: {
      type: Boolean,
      default: true
    },
    originalSound: {
      type: Boolean,
      default: true
    }
  },
  
  // Collaboration
  collaboration: {
    isCollaboration: {
      type: Boolean,
      default: false
    },
    collaborators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    approved: {
      type: Boolean,
      default: false
    }
  },
  
  // Sponsored/Paid Partnership
  sponsored: {
    isSponsored: {
      type: Boolean,
      default: false
    },
    brand: String,
    partnership: Boolean,
    disclosure: String
  },
  
  // Alt Text for accessibility
  altText: String,
  
  // Filter and Effects
  filter: String,
  edits: {
    brightness: Number,
    contrast: Number,
    saturation: Number,
    warmth: Number
  },
  
  // Analytics
  analytics: {
    engagementRate: Number,
    savedRate: Number,
    profileVisits: Number,
    websiteClicks: Number
  },
  
  // Reporting and Moderation
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }],
  
  // Content Guidelines
  isSensitive: {
    type: Boolean,
    default: false
  },
  
  ageRestricted: {
    type: Boolean,
    default: false
  },
  
  // SEO and Discovery
  keywords: [String],
  searchTags: [String],
  
  // Versioning
  version: {
    type: Number,
    default: 1
  },
  
  // Edit History
  editHistory: [{
    caption: String,
    location: {
      name: String,
      lat: Number,
      lng: Number
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]

}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'hashtags': 1 });
postSchema.index({ 'location.name': 1 });
postSchema.index({ 'mentions': 1 });
postSchema.index({ 'taggedUsers.user': 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ isArchived: 1 });
postSchema.index({ isDeleted: 1 });
postSchema.index({ type: 1 });
postSchema.index({ 'stats.likes': -1 });
postSchema.index({ 'stats.comments': -1 });

// Virtual for whether post has video
postSchema.virtual('isVideo').get(function() {
  return this.type === 'video' || this.type === 'reel';
});

// Virtual for whether post has multiple images
postSchema.virtual('isCarousel').get(function() {
  return this.type === 'carousel' && this.images.length > 1;
});

// Virtual for engagement rate
postSchema.virtual('engagementRate').get(function() {
  const totalEngagement = this.stats.likes + this.stats.comments + this.stats.shares;
  return this.stats.reach > 0 ? (totalEngagement / this.stats.reach) * 100 : 0;
});

// Methods
postSchema.methods = {
  // Check if user can view post
  canView: function(userId) {
    if (this.isDeleted || this.isArchived) return false;
    
    if (this.visibility === 'public') return true;
    if (this.visibility === 'private' && this.user.toString() === userId) return true;
    
    // For followers only - you'd need to check if the user follows the post owner
    // This would require additional logic
    return true;
  },
  
  // Add like
  addLike: function() {
    this.stats.likes += 1;
    return this.save();
  },
  
  // Remove like
  removeLike: function() {
    if (this.stats.likes > 0) {
      this.stats.likes -= 1;
    }
    return this.save();
  },
  
  // Add comment
  addComment: function() {
    this.stats.comments += 1;
    return this.save();
  },
  
  // Remove comment
  removeComment: function() {
    if (this.stats.comments > 0) {
      this.stats.comments -= 1;
    }
    return this.save();
  },
  
  // Increment views
  incrementViews: function() {
    this.stats.views += 1;
    return this.save();
  },
  
  // Archive post
  archive: function() {
    this.isArchived = true;
    return this.save();
  },
  
  // Unarchive post
  unarchive: function() {
    this.isArchived = false;
    return this.save();
  },
  
  // Soft delete
  softDelete: function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  },
  
  // Restore post
  restore: function() {
    this.isDeleted = false;
    this.deletedAt = undefined;
    return this.save();
  }
};

// Static methods
postSchema.statics = {
  // Find posts by user
  findByUser: function(userId, options = {}) {
    const { page = 1, limit = 10, includeArchived = false } = options;
    const skip = (page - 1) * limit;
    
    let query = { user: userId, isDeleted: false };
    if (!includeArchived) {
      query.isArchived = false;
    }
    
    return this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName photoURL verified')
      .populate('taggedUsers.user', 'username fullName photoURL')
      .populate('mentions', 'username fullName photoURL');
  },
  
  // Find popular posts
  findPopular: function(options = {}) {
    const { page = 1, limit = 10, days = 7 } = options;
    const skip = (page - 1) * limit;
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.find({
      createdAt: { $gte: date },
      isDeleted: false,
      isArchived: false,
      visibility: 'public'
    })
    .sort({ 'stats.likes': -1, 'stats.comments': -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName photoURL verified');
  },
  
  // Search posts
  search: function(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    return this.find({
      $or: [
        { caption: { $regex: query, $options: 'i' } },
        { 'hashtags': { $in: [new RegExp(query, 'i')] } },
        { 'location.name': { $regex: query, $options: 'i' } }
      ],
      isDeleted: false,
      isArchived: false,
      visibility: 'public'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName photoURL verified');
  },
  
  // Get feed posts for user
  getFeed: function(userId, followingUsers, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    // Include posts from users the current user follows + their own posts
    const usersToShow = [...followingUsers, userId];
    
    return this.find({
      user: { $in: usersToShow },
      isDeleted: false,
      isArchived: false,
      $or: [
        { visibility: 'public' },
        { visibility: 'followers' },
        { 
          visibility: 'private',
          user: userId // User can see their own private posts
        }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username fullName photoURL verified')
    .populate('taggedUsers.user', 'username fullName photoURL');
  }
};

// Middleware
postSchema.pre('save', function(next) {
  // Set type based on content
  if (this.video && this.video.url) {
    this.type = 'video';
  } else if (this.images && this.images.length > 1) {
    this.type = 'carousel';
  } else if (this.images && this.images.length === 1) {
    this.type = 'image';
  }
  
  // Extract hashtags from caption
  if (this.caption && this.isModified('caption')) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    this.hashtags = this.caption.match(hashtagRegex) || [];
    
    // Extract mentions
    const mentionRegex = /@[\w\u0590-\u05ff]+/g;
    const mentionsInText = this.caption.match(mentionRegex) || [];
    // You would need to convert these to user IDs in the actual implementation
  }
  
  next();
});

postSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

postSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model('Post', postSchema);