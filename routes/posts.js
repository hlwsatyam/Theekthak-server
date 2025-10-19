// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController.js');

// GET all posts by specific user (paginated)
router.get('/user/:userId', postController.getPostsByUser);

module.exports = router;