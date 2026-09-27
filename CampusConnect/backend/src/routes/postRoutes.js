const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentReaction,
  addCommentReply,
  toggleReaction
} = require('../controllers/postController');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/react', protect, toggleReaction);

router.post('/:id/comment', protect, addComment);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/comments/:commentId/react', protect, toggleCommentReaction);
router.post('/:id/comments/:commentId/reply', protect, addCommentReply);

module.exports = router;
