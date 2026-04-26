export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Next.js Server calls the Express Backend (Server-to-Server)
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const backendResponse = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body), // Forward the username and password
    });

    const data = await backendResponse.json();

    // 2. Return the Backend's response (Token, User, etc.) back to the Browser
    return res.status(backendResponse.status).json(data);
  } catch (err) {
    console.error("Proxy Error:", err);
    return res.status(500).json({ message: 'Internal Server Proxy Error' });
  }
}