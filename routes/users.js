const express = require('express');
const router = express.Router();
const User = require('../models/User');
 

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.headers.currentuser;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    const user = await User.findById(userId)
      .populate('followers', 'name username photoURL')
      .populate('following', 'name username photoURL')
      .populate('store', 'name isActive verificationStatus')
      .select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get user's store
router.get('/store', async (req, res) => {
  try {
    const userId = req.headers.currentuser;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    const user = await User.findById(userId).populate('store');
    
    if (!user || !user.store) {
      return res.status(404).json({ 
        success: false,
        error: 'Store not found' 
      });
    }

    res.json({
      success: true,
      store: user.store
    });
  } catch (error) {
    console.error('Error fetching user store:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers.currentuser;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email;
    delete updateData.uid;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

module.exports = router;