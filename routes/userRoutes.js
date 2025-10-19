// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile/me', auth, userController.getProfile);
router.get('/profile/:userId', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/:userId/follow', auth, userController.followUser);
router.post('/:userId/unfollow', auth, userController.unfollowUser);
router.get('/:userId/posts', auth, userController.getUserPosts);

module.exports = router;