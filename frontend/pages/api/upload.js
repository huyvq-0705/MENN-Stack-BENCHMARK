export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const response = await fetch(`${BACKEND_BASE}/upload`, {
      method: 'POST',
      headers: { 'content-type': req.headers['content-type'] },
      body: req, // Pipe trực tiếp request stream
      duplex: 'half'
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi Proxy Upload' });
  }
}