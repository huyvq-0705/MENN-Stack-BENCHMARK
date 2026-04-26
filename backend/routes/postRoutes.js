const express = require('express');
const router = express.Router();
const SeminarPost = require('../models/Post');

// Hàm Helper để kích hoạt Revalidate từ xa
const triggerRevalidate = (slug = '') => {
  const secret = process.env.NEXTJS_REVALIDATE_TOKEN;
  
  // Danh sách các "địa chỉ" cần được làm mới ngay lập tức
  const pathsToUpdate = [
    slug ? `/posts/${slug}` : null, // Trang chi tiết bài viết
    '/isr/homepage',                    // ĐÂY LÀ TRANG INDIGO CỦA BẠN
    '/'                             // Trang chủ chính (nếu cần)
  ].filter(Boolean); // Loại bỏ các giá trị null

  pathsToUpdate.forEach(path => {
    const nextUrl = `${process.env.NEXTJS_URL}/api/revalidate?secret=${secret}&path=${path}`;
    
    fetch(nextUrl)
      .then(res => res.json())
      .then(data => console.log(`🔄 Revalidate Triggered for [${path}]:`, data))
      .catch(err => console.log(`⚠️ Revalidate failed for ${path}`));
  });
};

// @desc    Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await SeminarPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// @desc    Search posts (Regex)
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const results = await SeminarPost.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search error" });
  }
});

// @desc    Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await SeminarPost.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Create post + Trigger ISR
router.post('/', async (req, res) => {
  try {
    const newPost = await SeminarPost.create(req.body);
    
    // Kích hoạt làm mới Trang chủ và Trang chi tiết mới
    triggerRevalidate(newPost.slug);

    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// @desc    Update a post + Trigger ISR
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await SeminarPost.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after' }
    );
    
    if (updatedPost) {
      // Kích hoạt làm mới Trang chủ và Trang chi tiết vừa sửa
      triggerRevalidate(updatedPost.slug);
    }

    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: "Error updating post" });
  }
});

// @desc    Delete a post + Trigger ISR
router.delete('/:id', async (req, res) => {
  try {
    // Tìm post trước khi xóa để lấy slug (phục vụ revalidate)
    const postToDelete = await SeminarPost.findById(req.params.id);
    if (!postToDelete) return res.status(404).json({ message: "Post not found" });

    const slug = postToDelete.slug;
    await SeminarPost.findByIdAndDelete(req.params.id);
    
    // Kích hoạt làm mới Trang chủ để gỡ bài viết khỏi danh sách
    triggerRevalidate(slug);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

module.exports = router;