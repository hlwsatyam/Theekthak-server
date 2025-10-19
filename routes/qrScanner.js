const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Store = require('../models/Store');


const User = require('../models/User');

// Generate QR Code for Store
router.get('/store/:storeId/qr', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ 
        success: false,
        error: 'Store not found' 
      });
    }

    // Generate store URL with metadata
    const storeData = {
      type: 'store',
      storeId: store._id.toString(),
      storeName: store.name,
      timestamp: new Date().toISOString(),
      url: `https://yourapp.com/store/${store._id}`
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(storeData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      store: {
        id: store._id,
        name: store.name,
        description: store.description,
        logo: store.logo
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate QR code' 
    });
  }
});






 


















 
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");
const fs = require("fs");
const fetch = require("node-fetch");
const upload = require('../middlewares/upload');
 

// POST /scan-qr
router.post("/scan", upload.single('photo'), async (req, res) => {
 console.log(req.file)
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;
    const buffer = fs.readFileSync(imagePath);
const image = await Jimp.read(buffer);
    const qr = new QrCode();

    qr.callback = async (err, value) => {
      if (err || !value) {
        console.error("QR decoding error:", err);
        return res.status(400).json({ error: "QR not detected" });
      }

      const qrData = value.result;
      console.log("✅ QR Content:", qrData);

      try {
        // Forward the QR data to your /scan endpoint
        const scanRes = await fetch("https://your-backend.com/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData }),
        });

        const finalData = await scanRes.json();

        res.json({
          success: true,
          qrContent: qrData,
          storeData: finalData.store || null,
        });
      } catch (fetchErr) {
        console.error("Error calling /scan:", fetchErr);
        res.status(500).json({ error: "Failed to forward QR data" });
      }
    };

    qr.decode(image.bitmap);
  } catch (error) {
    console.error("QR scan error:", error);
    res.status(500).json({ error: "Failed to scan QR" });
  }
});


























// Get store by ID for scanning
router.get('/store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!isValidObjectId(storeId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid store ID' 
      });
    }

    const store = await Store.findById(storeId)
      .populate('owner', 'name username photoURL isVerified followers following')
      .select('-taxInfo -socialMedia');

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        error: 'Store not found' 
      });
    }

    if (!store.isActive) {
      return res.status(400).json({ 
        success: false, 
        error: 'Store is inactive' 
      });
    }

    res.json({
      success: true,
      store: store
    });

  } catch (error) {
    console.error('Store fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch store' 
    });
  }
});

// Get user's store with QR code
router.get('/user/store-with-qr', async (req, res) => {
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

    // Generate QR code for the store
    const storeData = {
      type: 'store',
      storeId: user.store._id.toString(),
      storeName: user.store.name,
      timestamp: new Date().toISOString(),
      url: `StoreDetail`
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(storeData), {
      width: 200,
      margin: 1,
      color: {
        dark: '#333333',
        light: '#FFFFFF'
      }
    });

    const storeWithQR = {
      ...user.store.toObject(),
      qrCode: qrCodeDataUrl,
      shareUrl: `https://theekthak.com/store/${user.store._id}`
    };

    res.json({
      success: true,
      store: storeWithQR
    });
  } catch (error) {
    console.error('Error fetching user store with QR:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Validate ObjectId
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = router;