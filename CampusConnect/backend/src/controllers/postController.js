const mongoose = require('mongoose');
const Post = require('../models/Post');
const { UNIVERSITY_OPTIONS } = require('../constants/universities');

const serializePost = (post, viewerId) => {
  const returnedPost = post.toObject();
  returnedPost.hasUpvoted = viewerId
    ? post.upvotedBy.some((id) => id.toString() === viewerId.toString())
    : false;
  delete returnedPost.upvotedBy;
  return returnedPost;
};

const populatePost = (query) =>
  query
    .populate('authorId', 'name university batchYear')
    .populate('comments.authorId', 'name university batchYear');

const getPosts = async (req, res, next) => {
  try {
    const university = req.query.uni ? String(req.query.uni).trim() : '';
    const category = req.query.category ? String(req.query.category).trim() : '';
    const filter = {};

    if (university) {
      if (!UNIVERSITY_OPTIONS.includes(university)) {
        return res.status(400).json({
          success: false,
          message: `uni must be one of: ${UNIVERSITY_OPTIONS.join(', ')}`
        });
      }

      filter.universityTag = university;
    }

    if (category) {
      if (!['Admissions', 'Course Review', 'General'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'category must be one of: Admissions, Course Review, General'
        });
      }

      filter.category = category;
    }

    const posts = await populatePost(Post.find(filter).sort({ createdAt: -1 }));

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts: posts.map((post) => serializePost(post, req.user._id))
    });
  } catch (error) { return next(error); }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, universityTag, category } = req.body;

    if (!title || !content || !universityTag) {
      return res.status(400).json({
        success: false,
        message: 'title, content, and universityTag are required'
      });
    }

    const normalizedUniversity = String(universityTag).trim();
    const normalizedCategory = category
      ? String(category).trim()
      : 'General';

    if (!UNIVERSITY_OPTIONS.includes(normalizedUniversity)) {
      return res.status(400).json({
        success: false,
        message: `universityTag must be one of: ${UNIVERSITY_OPTIONS.join(', ')}`
      });
    }

    if (!['Admissions', 'Course Review', 'General'].includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: 'category must be one of: Admissions, Course Review, General'
      });
    }

    const post = await Post.create({
      title: String(title).trim(),
      content: String(content).trim(),
      universityTag: normalizedUniversity,
      category: normalizedCategory,
      authorId: req.user._id
    });

    const populatedPost = await populatePost(Post.findById(post._id));

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: serializePost(await populatedPost, req.user._id)
    });
  } catch (error) { return next(error); }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const normalizedText = text ? String(text).trim() : '';

    if (!normalizedText) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    if (normalizedText.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 1000 characters'
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    // Atomic $push prevents two simultaneous comments from overwriting one
    // another. authorId is always taken from the verified JWT user.
    const now = new Date();
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            text: normalizedText,
            authorId: req.user._id,
            createdAt: now,
            updatedAt: now
          }
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const populatedPost = await populatePost(Post.findById(post._id));

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      post: serializePost(await populatedPost, req.user._id)
    });
  } catch (error) { return next(error); }
};

const toggleUpvote = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post ID' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const userId = req.user._id.toString();
    const index = post.upvotedBy.findIndex((id) => id.toString() === userId);
    let upvoted;
    if (index >= 0) {
      post.upvotedBy.splice(index, 1);
      post.upvotesCount = Math.max(0, post.upvotesCount - 1);
      upvoted = false;
    } else {
      post.upvotedBy.push(req.user._id);
      post.upvotesCount += 1;
      upvoted = true;
    }
    await post.save();
    return res.status(200).json({ success: true, message: upvoted ? 'Post upvoted' : 'Upvote removed', upvoted, upvotesCount: post.upvotesCount });
  } catch (error) { return next(error); }
};

module.exports = { getPosts, createPost, addComment, toggleUpvote };