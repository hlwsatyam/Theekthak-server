const Reel = require('../models/Reel');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Create reel with file upload
const reelsCreation = async (req, res) => {
  try {
  
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      });
    } 

    const {
      title,
      description,
      category,
      tags,
      visibility,
      allowComments,
      allowDuet,
      allowStitch,
      music,id
    } = req.body;

    // Validate required fields
    if (!title || !category) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

 
 
   const userId=id
    // Parse tags if they're sent as string
    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === 'string' ? 
        tags.split(',').map(tag => tag.trim()) : 
        tags;
    }

    // Parse music data if sent as string
    let musicData = {};
    if (music) {
      try {
        musicData = typeof music === 'string' ? JSON.parse(music) : music;
      } catch (error) {
        musicData = { title: music, artist: '' };
      }
    }

    // Create reel in database
    const newReel = await Reel.create({
      user: userId,
      title,
      description: description || '',
      videoUrl: req.file.path, 
    
    
      category,
      tags: tagsArray,
      visibility: visibility || 'public',
      allowComments: allowComments !== 'false',
      allowDuet: allowDuet !== 'false',
      allowStitch: allowStitch !== 'false',
      music: musicData,
      location: req.body.location ? JSON.parse(req.body.location) : null,
      metadata: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadPath: req.file.path
      }
    });

    // Populate user data in response
    await newReel.populate('user', 'username profilePicture fullName');

    res.status(201).json({
      success: true,
      message: 'Reel uploaded successfully',
      data: {
        reel: newReel
      }
    });

  } catch (error) {
    console.error('Reel creation error:', error);
    
    // Delete uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error creating reel',
      error: error.message
    });
  }
};

// Get all reels with pagination
const getAllReels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reels = await Reel.find()
      .populate('user', 'username profilePicture fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reel.countDocuments();

    res.json({
      success: true,
      data: reels,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reels',
      error: error.message
    });
  }
};

// Get single reel by ID
const getReelById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('user', 'username profilePicture fullName')
      .populate('comments.user', 'username profilePicture');

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Increment view count
    reel.stats.views += 1;
    await reel.save();

    res.json({
      success: true,
      data: reel
    });
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reel',
      error: error.message
    });
  }
};

// Like/Unlike reel
const likeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    const userId = req.user.id;

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    const hasLiked = reel.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      reel.likes = reel.likes.filter(id => id.toString() !== userId);
      reel.stats.likes = Math.max(0, reel.stats.likes - 1);
    } else {
      // Like
      reel.likes.push(userId);
      reel.stats.likes += 1;
    }

    await reel.save();

    res.json({
      success: true,
      message: hasLiked ? 'Reel unliked' : 'Reel liked',
      data: {
        likes: reel.stats.likes,
        hasLiked: !hasLiked
      }
    });
  } catch (error) {
    console.error('Like reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating like',
      error: error.message
    });
  }
};

module.exports = {
  reelsCreation,
  getAllReels,
  getReelById,
  likeReel
};