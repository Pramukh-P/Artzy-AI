import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../mongodb/models/post.js';
import authMiddleware from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── GET COMMUNITY (PUBLIC) POSTS ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, sort = 'latest' } = req.query;

    let query = { isPublic: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 }; // default: latest
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'a-z') sortObj = { name: 1 };
    if (sort === 'z-a') sortObj = { name: -1 };

    const posts = await Post.find(query).sort(sortObj).select('-userId');
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET SINGLE POST (PUBLIC) ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isPublic: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── CREATE POST (PRIVATE) ───────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { prompt, photo, isPublic = false } = req.body;
    if (!prompt || !photo) {
      return res.status(400).json({ success: false, message: 'Prompt and photo are required' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(photo, {
      folder: 'artzy-ai',
      resource_type: 'image',
    });

    const newPost = await Post.create({
      userId: req.user._id,
      name: req.user.name,
      prompt,
      photo: uploadResult.secure_url,
      isPublic,
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Failed to save post' });
  }
});

// ─── GET MY POSTS ─────────────────────────────────────────────────────────────
router.get('/user/my', authMiddleware, async (req, res) => {
  try {
    const { filter } = req.query; // 'all' | 'shared' | 'private'
    let query = { userId: req.user._id };
    if (filter === 'shared') query.isPublic = true;
    if (filter === 'private') query.isPublic = false;

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TOGGLE SHARE TO COMMUNITY ────────────────────────────────────────────────
router.patch('/:id/share', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isPublic = !post.isPublic;
    await post.save();

    res.status(200).json({ success: true, data: post, isPublic: post.isPublic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE POST ──────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Delete from Cloudinary
    const publicId = post.photo.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.warn('Cloudinary delete failed:', e.message);
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
