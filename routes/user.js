// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
 

 
router.get('/profile/me',  userController.getMyProfile);
router.get('/profile/:userId',  userController.getProfile);
router.put('/profile',  userController.updateProfile);
router.post('/:userId/follow',  userController.followUser);
router.post('/:userId/unfollow',  userController.unfollowUser);
router.get('/:userId/posts',  userController.getUserPosts);

module.exports = router;