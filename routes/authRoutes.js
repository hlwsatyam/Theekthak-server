const express = require('express');
const router = express.Router();
const { handleGoogleAuth, checkUserExists, profileCreate } = require('../controllers/authController');
const upload = require('../middlewares/upload');
const User = require('../models/User');

// POST /api/auth/google - Handle Google authentication
router.post('/google', handleGoogleAuth);
router.post('/profileCreate', profileCreate);





router.get('/check-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });

    if (user) {
      return res.json({ exists: true, user });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ exists: false, error: 'Internal server error' });
  }
});








router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl =  req.file.path
  res.status(200).json({
    message: 'File uploaded successfully',
    fileUrl: fileUrl,
  });
});









// GET /api/auth/check-user/:uid - Check if user exists
router.get('/check-user/:uid', checkUserExists);

module.exports = router;