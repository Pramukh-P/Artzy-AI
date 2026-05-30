import express from 'express';
import * as dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import authMiddleware from '../middleware/auth.js';
import { checkAndUpdateQuota } from '../utils/quota.js';
import User from '../mongodb/models/user.js';

dotenv.config();
const router = express.Router();
const client = new InferenceClient(process.env.HF_TOKEN);

router.get('/', (req, res) => {
  res.send('HuggingFace AI Route Working');
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Re-fetch user to get latest quota state
    const user = await User.findById(req.user._id);

    // Check/reset weekly quota
    const quotaResult = checkAndUpdateQuota(user);
    if (!quotaResult.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Weekly image limit reached (10/week)',
        resetDate: quotaResult.resetDate,
        remaining: 0,
      });
    }

    // Increment before generation (prevents race conditions)
    user.imagesThisWeek += 1;
    await user.save();

    try {
      const image = await client.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: prompt,
        parameters: { negative_prompt: 'blurry, bad quality, low resolution' },
      });

      const arrayBuffer = await image.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');

      res.status(200).json({
        success: true,
        photo: base64Image,
        remaining: quotaResult.remaining - 1,
      });
    } catch (genError) {
      // Rollback quota on generation failure
      user.imagesThisWeek = Math.max(0, user.imagesThisWeek - 1);
      await user.save();
      throw genError;
    }
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ success: false, message: 'Image generation failed. Please try again.' });
  }
});

// Get current user's quota status
router.get('/quota', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const quotaResult = checkAndUpdateQuota(user);
    // Save if week was reset
    await user.save();
    res.status(200).json({
      success: true,
      imagesThisWeek: user.imagesThisWeek,
      remaining: quotaResult.remaining,
      weekStart: user.weekStart,
      resetDate: quotaResult.resetDate || (() => {
        const d = new Date(user.weekStart || Date.now());
        d.setUTCDate(d.getUTCDate() + 7);
        return d;
      })(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get quota' });
  }
});

export default router;
