const mongoose = require('mongoose');
const Post = require('../models/Post');
const { UNIVERSITY_OPTIONS } = require('../constants/universities');

const serializePost = (post, viewerId) => {
  const returnedPost = post.toObject();
  returnedPost.hasUpvoted = viewerId ? post.upvotedBy.some((id) => id.toString() === viewerId.toString()) : false;
  delete returnedPost.upvotedBy;
  return returnedPost;
};

const populatePost = (query) => query.populate('authorId', 'name university batchYear').populate('comments.authorId', 'name university');

const getPosts = async (req, res, next) => {
  try {
    const university = req.query.uni ? String(req.query.uni).trim() : '';
    const filter = {};
    if (university) {
      if (!UNIVERSITY_OPTIONS.includes(university)) return res.status(400).json({ success: false, message: `uni must be one of: ${UNIVERSITY_OPTIONS.join(', ')}` });
      filter.universityTag = university;
    }
    const posts = await populatePost(Post.find(filter).sort({ createdAt: -1 }));
    return res.status(200).json({ success: true, count: posts.length, posts: posts.map((post) => serializePost(post, req.user._id)) });
  } catch (error) { return next(error); }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, universityTag } = req.body;
    if (!title || !content || !universityTag) return res.status(400).json({ success: false, message: 'title, content, and universityTag are required' });
    const post = await Post.create({ title: String(title).trim(), content: String(content).trim(), universityTag: String(universityTag).trim(), authorId: req.user._id });
    const populatedPost = await populatePost(Post.findById(post._id));
    return res.status(201).json({ success: true, message: 'Post created successfully', post: serializePost(await populatedPost, req.user._id) });
  } catch (error) { return next(error); }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ success: false, message: 'Comment text is required' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post ID' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.comments.push({ text: String(text).trim(), authorId: req.user._id });
    await post.save();
    const populatedPost = await populatePost(Post.findById(post._id));
    return res.status(201).json({ success: true, message: 'Comment added successfully', post: serializePost(await populatedPost, req.user._id) });
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
