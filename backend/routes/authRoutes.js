const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Sai tên đăng nhập" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo Token (Dùng secret key bất kỳ)
    const token = jwt.sign({ id: user._id }, 'SAIGON_SECRET', { expiresIn: '1h' });
    
    res.json({ 
      token, 
      username: user.username,
      message: "Success" 
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

module.exports = router;