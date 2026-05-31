import express from 'express';
import * as dotenv from 'dotenv';
import { checkContent, BLOCK_MESSAGE } from '../utils/contentFilter.js';

dotenv.config();
const router = express.Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `You are Artzy Bot, a friendly AI assistant that helps users craft perfect image generation prompts for Stable Diffusion XL.

Your personality: enthusiastic, warm, creative. Use art emojis occasionally: 🎨 ✨ 🖌️

Your job:
1. If the user idea is clear enough immediately generate a refined prompt
2. If vague ask 1-2 specific clarifying questions (NEVER more than 2 at once)
3. After clarification generate the prompt
4. If user wants changes update and show new prompt

When you have a ready prompt, ALWAYS wrap it in these exact tags:
<PROMPT>your detailed prompt here</PROMPT>

A great Stable Diffusion prompt includes:
- Subject: specific description
- Art style: digital art / oil painting / watercolor / 3D render / photography
- Lighting: golden hour / studio lit / neon / soft ambient
- Mood: dreamy / dramatic / cozy / epic
- Quality hints: highly detailed, 8k resolution, masterpiece, cinematic

Example:
<PROMPT>A majestic silver dragon perched atop a misty mountain at golden hour, fantasy digital art, volumetric god rays, highly detailed iridescent scales, dramatic low-angle perspective, epic cinematic atmosphere, 8k resolution, masterpiece quality</PROMPT>

After showing a PROMPT add a 1-line note about what makes it strong then ask if they want changes.

ABSOLUTE RULES never break:
- NEVER generate prompts for: sexual content, nudity, explicit material, graphic violence, real person misleading likeness, hate content, child harm
- If asked for blocked content: politely decline, briefly explain, immediately offer a creative alternative
- Keep responses concise
- Never ask more than 2 questions before generating`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Messages array required' });
    }

    // Content moderation on last user message
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      const check = checkContent(lastUser.content);
      if (check.blocked) {
        return res.status(200).json({
          success: true,
          message: "I can't help with that type of content — it goes against our community guidelines. But I'd love to help you create something amazing! 🎨 Tell me a different creative idea!",
          hasPrompt: false,
          prompt: null,
        });
      }
    }

    // Build Gemini conversation format
    const geminiMessages = messages
      .filter((m) => m.id !== 'init')
      .map((m) => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Need at least one message
    if (geminiMessages.length === 0) {
      geminiMessages.push({ role: 'user', parts: [{ text: 'Hello, introduce yourself briefly.' }] });
    }

    // Gemini requires alternating user/model — ensure it starts with user
    // and no two consecutive same roles
    const cleanedMessages = [];
    for (const msg of geminiMessages) {
      const last = cleanedMessages[cleanedMessages.length - 1];
      if (last && last.role === msg.role) {
        // Merge same-role consecutive messages
        last.parts[0].text += '\n' + msg.parts[0].text;
      } else {
        cleanedMessages.push({ ...msg, parts: [{ text: msg.parts[0].text }] });
      }
    }
    // Must start with user
    if (cleanedMessages[0]?.role === 'model') {
      cleanedMessages.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: cleanedMessages,
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.7,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_LOW_AND_ABOVE'    },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    const response = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errData);
      throw new Error(errData?.error?.message || 'Gemini API error');
    }

    const data = await response.json();

    // Check if blocked by Gemini safety filters
    const candidate = data.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY') {
      return res.status(200).json({
        success: true,
        message: "I can't help with that content. Let's create something amazing instead! 🎨 Try a different creative idea.",
        hasPrompt: false,
        prompt: null,
      });
    }

    const rawContent = candidate.content?.parts?.[0]?.text || '';

    // Extract prompt from tags
    const promptMatch = rawContent.match(/<PROMPT>([\s\S]*?)<\/PROMPT>/);
    const extractedPrompt = promptMatch ? promptMatch[1].trim() : null;

    // Remove PROMPT tags for display message
    const displayMessage = rawContent.replace(/<PROMPT>[\s\S]*?<\/PROMPT>/g, '').trim();

    res.status(200).json({
      success: true,
      message: displayMessage,
      hasPrompt: !!extractedPrompt,
      prompt: extractedPrompt,
    });

  } catch (error) {
    console.error('Prompt bot error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: "I'm having a little hiccup right now 😅 Please try again in a moment!",
    });
  }
});

export default router;
