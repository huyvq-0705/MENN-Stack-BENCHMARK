const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: String,
  coverImage: String,
  category: { type: String, default: "General" },
  publishedAt: { type: String, default: () => new Date().toLocaleDateString('vi-VN') }
}, { 
  collection: 'seminarPosts', 
  timestamps: true 
});

module.exports = mongoose.model('SeminarPost', postSchema);