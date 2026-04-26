const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require('../config/spaces');

// Cấu hình Multer lưu vào bộ nhớ đệm (Buffer)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn 10MB cho ảnh blog
});

// Helper xử lý tên file và URL
const safeFileName = (name) => name.replace(/[^\w.-]/g, "_");
const joinUrl = (base, path) => `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: "No file uploaded" });

    // Đổi logic tạo Key tại đây
    // Bỏ Date.now() nếu bạn muốn tên file giữ nguyên như "Dinh Doc Lap.jpg"
    // Nhưng nên giữ lại một phần random để tránh trùng tên file khi upload nhiều lần
    const fileName = safeFileName(file.originalname);
    const key = `Seminar/${fileName}`; 

    const command = new PutObjectCommand({
      Bucket: process.env.SPACES_BUCKET,
      Key: key, // File sẽ nằm trong thư mục Seminar/
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    });

    await s3.send(command);

    // URL sẽ tự động nối SPACES_CDN + Seminar/tên-file.jpg
    const imageUrl = joinUrl(process.env.SPACES_CDN, key);

    console.log("🌍 URL mới:", imageUrl);

    res.json({
      success: true,
      imageUrl,
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;