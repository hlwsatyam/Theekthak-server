const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { reelsCreation, getAllReels, getReelById, likeReel } = require('../controllers/reelsAuth');
 

// Create reel with file upload
router.post('/', upload.single('video'), reelsCreation);

// Get all reels
router.get('/', getAllReels);

// Get single reel
router.get('/:id', getReelById);

// Like/Unlike reel
router.post('/:id/like', likeReel);

module.exports = router;