import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/HomeNavbar';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // CALLING THE PROXY: Notice no 'http://localhost:5123' here!
      const res = await fetch('/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // SUCCESS: Store data for CSR state
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        
        // Immediate Redirect to Dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ trung gian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Head>
        <title>Admin Login | Sài Gòn Blog</title>
      </Head>
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-700 px-6 py-1.5 flex justify-between items-center">
        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-emerald-400">Admin Access</span>
        <span className="text-[9px] text-slate-500 tracking-tight italic">BFF Proxy Mode — Secure channelling</span>
      </div>

      <main className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-emerald-500 mb-3 block">Hệ thống quản trị</span>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tighter">Đăng nhập</h1>
            <p className="text-slate-500 text-sm">Xác thực để truy cập bảng điều khiển.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 block mb-1.5">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 block mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:border-emerald-500 outline-none transition-colors" 
                required 
              />
            </div>

            {error && <p className="text-xs text-rose-500 font-medium italic">⚠ {error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white text-xs font-black tracking-[0.2em] uppercase py-3 rounded-md hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <Link href="/" className="text-xs text-slate-400 hover:text-emerald-600 transition-colors">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}