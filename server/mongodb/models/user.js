import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: null }, // null for Google OAuth users
  googleId: { type: String, default: null },
  avatar: { type: String, default: null },
  isVerified: { type: Boolean, default: false },

  // OTP fields
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpType: { type: String, enum: ['verify', 'reset', null], default: null },

  // Weekly image quota
  weekStart: { type: Date, default: null }, // Monday of the current quota week
  imagesThisWeek: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
