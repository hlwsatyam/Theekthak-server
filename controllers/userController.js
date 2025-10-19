// controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post.js');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.userId  
 
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', 'username fullName photoURL')
      .populate('following', 'username fullName photoURL')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get posts count
    const postsCount = await Post.countDocuments({ user: userId, isArchived: false });

    // Check if current user is following this user
    let isFollowing = false;
    if (req.headers.currentuser && req.headers.currentuser !== userId) {
      const currentUser = await User.findById( req.headers.currentuser);
      isFollowing = currentUser.following.includes(userId);
    }
 
    // Check if it's own profile
    const isOwnProfile = req.headers.currentuser === userId;

    res.json({
      success: true,
      ...user,
      postsCount,
      isFollowing,
      isOwnProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};




















exports.getMyProfile = async (req, res) => {
  try {
    const userId =  req.headers.currentuser;
  

    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', 'username fullName photoURL')
      .populate('following', 'username fullName photoURL')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get posts count
    const postsCount = await Post.countDocuments({ user: userId, isArchived: false });

  
    res.json({
      success: true,
      ...user,
      postsCount,
      isOwnProfile:true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};












// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, fullName, bio, website, email, phone, gender } = req.body;
    
    // Check if username is taken
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username is already taken' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        fullName,
        bio,
        website,
        email,
        phone,
        gender,
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// 




 
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.headers.currentuser;
 
    if (userId === currentUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot follow yourself' 
      });
    }
 
    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
       console.log('userToFollow')
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
       console.log('alredy')
      return res.status(400).json({ 
        success: false, 
        message: 'Already following this user' 
      });
    }

    // Add to following and followers
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId }
    });

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Error following user' });
  }
};





// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId =  req.headers.currentuser;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove from following and followers
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId }
    });

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unfollowing user' });
  }
};

// Get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      user: userId, 
      isArchived: false 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username photoURL verified')
      .lean();

    const totalPosts = await Post.countDocuments({ 
      user: userId, 
      isArchived: false 
    });

    res.json({
      success: true,
      posts,
      totalPosts,
      nextPage: posts.length === limit ? page + 1 : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
};