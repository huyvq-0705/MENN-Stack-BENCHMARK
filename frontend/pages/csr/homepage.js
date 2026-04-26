import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import HomeSlider from '../../components/HomeSlider';
import MegaFooter from '../../components/MegaFooter';
import BlogGrid from '../../components/BlogGrid';

export default function CSRPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renderTime, setRenderTime] = useState(0);

  // Mock data cho Slider và Footer để đồng bộ giao diện
  const images = [
    "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
    "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
    "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg"
  ];
  const tags = ["CSR", "Proxy", "BFF", "Security", "Browser-Fetch"];

  useEffect(() => {
    const startTime = performance.now();

    const fetchViaProxy = async () => {
      try {
        // GIẢ LẬP ĐỘ TRỄ 2.5s (Để thấy rõ hiệu ứng Skeleton cho Seminar)
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Gọi đến API Proxy nội bộ thay vì gọi trực tiếp Port 5123
        const res = await fetch('/api/blog-proxy');
        if (!res.ok) throw new Error("Proxy fetch failed");
        
        const data = await res.json();
        
        setPosts(data);
        setIsLoading(false);
        setRenderTime((performance.now() - startTime).toFixed(0));
      } catch (error) {
        console.error("Fetch error:", error);
        setIsLoading(false);
      }
    };

    fetchViaProxy();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head><title>CSR Mode (Secure Proxy) | Blog HCM</title></Head>
      <Navbar />
      
      {/* Indicator thanh trạng thái màu Amber */}
      <div className="bg-amber-500 text-slate-900 px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-red-600 animate-ping' : 'bg-green-600'}`}></span>
          <span>Mode: Client-Side Rendering (via Proxy)</span>
        </div>
        <span>Security: Backend IP Hidden 🛡️</span>
      </div>

      {/* Hero Section */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
        {!isLoading ? (
          <HomeSlider images={images} />
        ) : (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
            <span className="text-slate-500 font-mono text-sm tracking-widest">LOADING ASSETS...</span>
          </div>
        )}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-amber-400 uppercase">CSR RENDERING</h1>
          <p className="text-white font-mono bg-amber-600/90 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            {isLoading ? "Waiting for Server-to-Server Proxy..." : `Hydrated in ${renderTime}ms`}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="flex items-center justify-between mb-10 border-l-8 border-amber-500 pl-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">Bài viết (Secure CSR)</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">FETCHING FLOW: Browser ➔ Next.js Proxy ➔ Express Backend</p>
          </div>
          <span className="hidden md:block text-[10px] font-mono text-amber-700 bg-amber-100 px-3 py-1 rounded border border-amber-200 font-bold uppercase">
            CORS: Avoided
          </span>
        </div>

        {isLoading ? (
          // SKELETON LOADER: Bằng chứng trực quan cho CSR trong Seminar
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
                <div className="h-8 w-full bg-slate-200 rounded mb-6"></div>
                <div className="h-20 w-full bg-slate-100 rounded mb-4"></div>
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          // HIỂN THỊ BLOG GRID KHI ĐÃ CÓ DỮ LIỆU
          <BlogGrid posts={posts} modeColor="amber" />
        )}
      </main>

      <MegaFooter tags={tags} />
    </div>
  );
}