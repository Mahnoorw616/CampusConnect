const mongoose = require('mongoose');
const Post = require('../models/Post');
const { UNIVERSITY_OPTIONS } = require('../constants/universities');

const serializePost = (post, viewerId) => {
  const returnedPost = post.toObject();
  const viewerStr = viewerId ? viewerId.toString() : '';
  const userRec = (post.userReactions || []).find(
    (r) => r.userId && r.userId.toString() === viewerStr
  );
  returnedPost.userReaction = userRec ? userRec.reactionType : undefined;
  if (!returnedPost.reactions) {
    returnedPost.reactions = { Relatable: 0, Helpful: 0, Support: 0, Vibe: 0 };
  }
  delete returnedPost.userReactions;
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
    const { title, content, universityTag, category, mediaUrl } = req.body;

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
      mediaUrl: mediaUrl ? String(mediaUrl) : '',
      reactions: { Relatable: 0, Helpful: 0, Support: 0, Vibe: 0 },
      userReactions: [],
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

const toggleReaction = async (req, res, next) => {
  try {
    const { reactionType } = req.body;
    if (!['Relatable', 'Helpful', 'Support', 'Vibe'].includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const userReactions = post.userReactions || [];
    const existingIndex = userReactions.findIndex(
      (r) => r.userId && r.userId.toString() === userIdStr
    );

    if (!post.reactions) {
      post.reactions = { Relatable: 0, Helpful: 0, Support: 0, Vibe: 0 };
    }

    let newUserReaction;
    if (existingIndex >= 0) {
      const existingType = userReactions[existingIndex].reactionType;
      post.reactions[existingType] = Math.max(0, (post.reactions[existingType] || 0) - 1);

      if (existingType === reactionType) {
        userReactions.splice(existingIndex, 1);
        newUserReaction = undefined;
      } else {
        userReactions[existingIndex].reactionType = reactionType;
        post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
        newUserReaction = reactionType;
      }
    } else {
      userReactions.push({ userId: req.user._id, reactionType });
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      newUserReaction = reactionType;
    }

    post.userReactions = userReactions;
    post.markModified('reactions');
    post.markModified('userReactions');
    await post.save();

    return res.status(200).json({
      success: true,
      reactions: post.reactions,
      userReaction: newUserReaction,
    });
  } catch (error) { return next(error); }
};

module.exports = { getPosts, createPost, addComment, toggleReaction };