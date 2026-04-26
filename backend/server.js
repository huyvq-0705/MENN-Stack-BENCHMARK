const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize app
const app = express();


app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/upload', require('./routes/uploadRoutes'));

// Start Server
const PORT = process.env.PORT || 5123;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});