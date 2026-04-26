export default async function handler(req, res) {
  const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
  const BACKEND = `${BACKEND_BASE}/api/posts`;
  try {
    const response = await fetch(BACKEND, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body) : null,
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy Fetch Error' });
  }
}