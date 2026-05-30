import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import User from '../mongodb/models/user.js';
import { sendWelcomeEmail } from '../utils/email.js';

dotenv.config();
const router = express.Router();

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
        let isNew = false;

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name,
            email,
            avatar,
            isVerified: true,
            password: null,
          });
          isNew = true;
          sendWelcomeEmail(email, name).catch(console.error); // non-blocking
        } else {
          // Link Google ID if existing email user
          if (!user.googleId) user.googleId = profile.id;
          if (!user.avatar && avatar) user.avatar = avatar;
          user.isVerified = true;
          await user.save();
        }

        return done(null, { user, isNew });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

// ─── GOOGLE AUTH INITIATE ─────────────────────────────────────────────────────
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// ─── GOOGLE AUTH CALLBACK ─────────────────────────────────────────────────────
router.get(
  '/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const { user } = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = encodeURIComponent(
      JSON.stringify({ id: user._id, name: user.name, email: user.email, avatar: user.avatar })
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`);
  }
);

export default router;
