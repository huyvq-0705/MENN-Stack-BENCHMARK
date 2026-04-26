import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState(null);

  // Kiểm tra trạng thái đăng nhập khi trang web load xong (CSR logic)
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  const isActive = (path) => router.pathname.includes(path);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${search}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-2">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-900 group-hover:rotate-12 transition-transform uppercase">
            SG
          </div>
          <span className="text-white font-bold tracking-tighter text-xl hidden lg:block">Sài Gòn Blog</span>
        </Link>

        {/* SEARCH BAR */}
        <div className="flex flex-col items-center shrink-0 w-full max-w-xs">
          <form onSubmit={handleSearch} className="w-full relative">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </form>
          <span className="text-[8px] font-black text-rose-500 tracking-[0.2em] uppercase mt-1 opacity-70">
            SSR Engine
          </span>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex gap-1 md:gap-2 items-center">
          
          {/* ADMIN / USER SECTION - Conditional Link based on Login State */}
          <Link href={userName ? "/admin/dashboard" : "/admin/login"}>
            <div className={`px-4 py-2 rounded-md transition-all duration-200 flex flex-col items-center border-b-2 cursor-pointer ${
              isActive('/admin') 
              ? 'border-emerald-500 bg-slate-800' 
              : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}>
              <span className={`text-[10px] font-black tracking-widest uppercase ${isActive('/admin') ? 'text-emerald-400' : ''}`}>
                {userName ? `USER: ${userName}` : "ADMIN"}
              </span>
              <span className="text-[9px] opacity-40 uppercase hidden md:block tracking-tighter">
                {userName ? "Dashboard" : "CSR"}
              </span>
            </div>
          </Link>

          {/* BENCHMARK (ISR) */}
          <Link href="/isr/homepage">
            <div className={`px-4 py-2 rounded-md transition-all duration-200 flex flex-col items-center border-b-2 cursor-pointer ${
              isActive('/isr/homepage') 
              ? 'border-rose-500 bg-slate-800' 
              : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}>
              <span className={`text-[10px] font-black tracking-widest ${isActive('/isr/homepage') ? 'text-rose-400' : ''}`}>
                BENCHMARK
              </span>
              <span className="text-[9px] opacity-40 uppercase hidden md:block tracking-tighter">ISR</span>
            </div>
          </Link>

        </div>
      </div>
    </nav>
  );
}