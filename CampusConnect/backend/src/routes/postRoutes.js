const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getPosts, createPost, addComment, toggleReaction } = require('../controllers/postController');
const router = express.Router();
router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.post('/:id/comment', protect, addComment);
router.post('/:id/react', protect, toggleReaction);
module.exports = router;
