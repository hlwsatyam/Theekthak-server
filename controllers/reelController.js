// controllers/reelController.js
const Reel = require('../models/Reel');
const User = require('../models/User');
const Comment = require('../models/comment');
const Like = require('../models/likes');

// Get reels feed
exports.getReelsFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
 
    const reels = await Reel.find({ visibility: 'public' })
      .populate('user', 'fullName   photoURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  
    // Add like status
    const reelsWithStatus = await Promise.all(
      reels.map(async (reel) => {
        const hasLiked = await Like.exists({ 
          user: req.query.id, 
          targetId: reel._id 
        });
        return { ...reel, hasLiked: !!hasLiked };
      })
    );

    res.json({
      success: true,
      reels: reelsWithStatus,
      nextPage: reels.length === limit ? page + 1 : null
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Error fetching reels' });
  }
};

 




exports.toggleLike = async (req, res) => {
  try {
    const { reelId, id: userId } = req.params;

    // Default target type is Reel
    const targetType = "Reel";
    const targetId = reelId;

    // Check if like already exists
    const existingLike = await Like.findOne({ user: userId, targetId, targetType });

    let hasLiked;

    if (existingLike) {
      // ✅ Unlike
      await existingLike.deleteOne();
      hasLiked = false;

      await Reel.findByIdAndUpdate(reelId, { $inc: { "stats.likes": -1 } });
       
    } else {
      // ✅ Like
      await Like.create({ user: userId, targetId, targetType });
      hasLiked = true;

      await Reel.findByIdAndUpdate(reelId, { $inc: { "stats.likes": 1 } });
      
    }

  
    const updatedReel = await Reel.findById(reelId);

    res.json({
      success: true,
      likes: updatedReel?.stats?.likes || 0,
      hasLiked,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error toggling like" });
  }
};








// Add comment
exports.addComment = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { text , userId  } = req.body;
     
 
    const comment = new Comment({
      user: userId,
      reel: reelId,
      text: text.trim()
    });

    await comment.save();
    await comment.populate('user', 'username profilePicture verified');

    // Update comment count
    await Reel.findByIdAndUpdate(reelId, { $inc: { 'stats.comments': 1 } });

    res.json({
      success: true,
      comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// Get comments for reel
exports.getComments = async (req, res) => {
  try {
    const { reelId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ reel: reelId })
      .populate('user', 'username profilePicture verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalComments = await Comment.countDocuments({ reel: reelId });

    res.json({
      success: true,
      comments,
      totalComments,
      nextPage: comments.length === limit ? page + 1 : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
};

// Increment views
exports.incrementViews = async (req, res) => {
  try {
    const { reelId } = req.params;
    await Reel.findByIdAndUpdate(reelId, { $inc: { 'stats.views': 1 } });
    res.json({ success: true, message: 'View count updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating views' });
  }
};