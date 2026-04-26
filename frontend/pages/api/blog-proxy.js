// frontend/pages/api/blog-proxy.js
export default async function handler(req, res) {
  // Tách base URL và đường dẫn API ra
  const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
  
  try {
    // Ghép nối an toàn
    const response = await fetch(`${BACKEND_BASE}/api/posts`);
    
    if (!response.ok) {
      throw new Error(`Backend trả về lỗi: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi Proxy:", error);
    res.status(500).json({ message: "Không thể kết nối tới Backend Service" });
  }
}