const express = require('express');
const router = express.Router();
const { handleGoogleAuth, checkUserExists, profileCreate } = require('../controllers/authController');
const upload = require('../middlewares/upload');

// POST /api/auth/google - Handle Google authentication
router.post('/google', handleGoogleAuth);
router.post('/profileCreate', profileCreate);



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