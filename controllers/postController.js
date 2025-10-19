// controllers/postController.js
const Post = require('../models/Post');

exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Fetch paginated posts by user
    const posts = await Post.findByUser(userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    // Count total posts (for pagination info)
    const total = await Post.countDocuments({ user: userId, isDeleted: false });

    return res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      posts,
    });
  } catch (error) {
    console.error('❌ Error fetching posts by user:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching posts',
      error: error.message,
    });
  }
};
