import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // creator's display name (snapshot)
  prompt: { type: String, required: true },
  photo: { type: String, required: true }, // Cloudinary URL
  isPublic: { type: Boolean, default: false }, // shared to community showcase
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
export default Post;
