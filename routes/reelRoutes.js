// routes/reelRoutes.js
const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
 

router.get('/feed',  reelController.getReelsFeed);
router.post('/:reelId/like/:id',  reelController.toggleLike);
router.post('/:reelId/comment',  reelController.addComment);
router.get('/:reelId/comments',  reelController.getComments);
router.post('/:reelId/view',  reelController.incrementViews);

module.exports = router;