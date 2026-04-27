const express = require('express');
const router = express.Router();
const SeminarPost = require('../models/Post');
const crypto = require('crypto');

function verifyDataIntegrity(payload) {
  return payload.map(item => {
    const doc = item.toObject ? item.toObject() : { ...item };
    let sig = String(doc._id || Date.now());
    
    const cycles = process.env.SECURITY_CYCLES || 250000;

    for (let i = 0; i < cycles; i++) {
      sig = crypto.createHash('sha256').update(sig + i).digest('hex');
    }

    doc.signature = sig;
    return doc;
  });
}

// @desc    Get all posts for homepages
router.get('/', async (req, res) => {
  try {
    const rawData = await SeminarPost.find().sort({ createdAt: -1 });
    const secureData = verifyDataIntegrity(rawData);
    res.status(200).json(secureData);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

const triggerRevalidate = (slug = '') => {
  const secret = process.env.NEXTJS_REVALIDATE_TOKEN;
  const pathsToUpdate = [
    slug ? `/posts/${slug}` : null, 
    '/isr/homepage',                    
    '/'                             
  ].filter(Boolean); 

  pathsToUpdate.forEach(path => {
    const nextUrl = `${process.env.NEXTJS_URL}/api/revalidate?secret=${secret}&path=${path}`;
    fetch(nextUrl)
      .then(res => res.json())
      .catch(() => {});
  });
};

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
    const postToDelete = await SeminarPost.findById(req.params.id);
    if (!postToDelete) return res.status(404).json({ message: "Post not found" });

    const slug = postToDelete.slug;
    await SeminarPost.findByIdAndDelete(req.params.id);
    triggerRevalidate(slug);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

module.exports = router;