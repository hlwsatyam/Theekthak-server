// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');
const QRCode = require('qrcode');
// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.headers.currentuser;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId)
      .populate('followers', 'name username photoURL')
      .populate('following', 'name username photoURL')
      .populate('store', 'name isActive verificationStatus')
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's store
router.get('/store', async (req, res) => {
  try {
    const userId = req.headers.currentuser;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId).populate('store');
    
    if (!user || !user.store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(user.store);
  } catch (error) {
    console.error('Error fetching user store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers.currentuser;
    const updateData = req.body;

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
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});











router.get('/store/:storeId/qr', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Generate store URL
    const storeUrl = `https://yourapp.com/store/${storeId}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      storeUrl: storeUrl,
      store: {
        name: store.name,
        id: store._id
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Generate Shareable Store Link with Metadata
router.get('/store/:storeId/share', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId)
      .populate('owner', 'name username photoURL');
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const shareData = {
      storeId: store._id,
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo,
      storeUrl: `https://yourapp.com/store/${storeId}`,
      ownerName: store.owner.name,
      timestamp: new Date().toISOString()
    };

    // Generate QR code for the share data
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(shareData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      shareData: shareData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Share QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate share QR code' });
  }
});



router.get('/store/:storeId/qr', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Generate store URL
    const storeUrl = `https://yourapp.com/store/${storeId}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      storeUrl: storeUrl,
      store: {
        name: store.name,
        id: store._id
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Generate Shareable Store Link with Metadata
router.get('/store/:storeId/share', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId)
      .populate('owner', 'name username photoURL');
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const shareData = {
      storeId: store._id,
      storeName: store.name,
      storeDescription: store.description,
      storeLogo: store.logo,
      storeUrl: `https://yourapp.com/store/${storeId}`,
      ownerName: store.owner.name,
      timestamp: new Date().toISOString()
    };

    // Generate QR code for the share data
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(shareData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      shareData: shareData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Share QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate share QR code' });
  }
});


router.get('/:storeId/with-qr', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId)
      .populate('owner', 'name username photoURL');
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Generate QR code
    const storeUrl = `https://yourapp.com/store/${storeId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      width: 200,
      margin: 1
    });

    const storeWithQR = {
      ...store.toObject(),
      qrCode: qrCodeDataUrl,
      shareUrl: storeUrl
    };

    res.json(storeWithQR);
  } catch (error) {
    console.error('Error fetching store with QR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






module.exports = router;