import Head from 'next/head';
import Navbar from '../../components/Navbar';
import HomeSlider from '../../components/HomeSlider';
import MegaFooter from '../../components/MegaFooter';
import BlogGrid from '../../components/BlogGrid';

export default function ISRPage({ posts, images, tags, timeStamp }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head><title>ISR Mode (On-demand) | Blog HCM</title></Head>
      <Navbar />
      
      <div className="bg-indigo-600 text-white px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-lg">
        <span>Mode: On-demand ISR</span>
        <span>Last Built: {timeStamp}</span>
      </div>

      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-indigo-900">
        <HomeSlider images={images} />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-indigo-400">ISR RENDERING</h1>
          <p className="text-white font-mono bg-indigo-700 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            Static Speed + Instant Updates
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="flex items-center justify-between mb-10 border-l-8 border-indigo-500 pl-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">Bài viết (Hybrid)</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1 animate-pulse">Waiting for Webhook to trigger re-build...</p>
          </div>
          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-3 py-1 rounded border border-indigo-200 font-bold uppercase">
            Efficiency: 100%
          </span>
        </div>

        <BlogGrid posts={posts} modeColor="indigo" />
        
      </main>

      <MegaFooter tags={tags} />
    </div>
  );
}

export async function getStaticProps() {
  console.log("🛠️ Next.js is building (or re-building) the ISR page...");
  
  // 1. Sử dụng biến môi trường cho URL nội bộ, fallback về IP local để tránh lỗi IPv6/IPv4
  // Trên Coolify, bạn sẽ đặt INTERNAL_BACKEND_URL = http://tên-service-backend:5123
  const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
  const API_URL = `${BACKEND_BASE}/api/posts`;

  try {
    const res = await fetch(API_URL);
    
    // Kiểm tra nếu request thất bại
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const posts = await res.json();

    const images = [
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg"
    ];

    return {
      props: {
        posts,
        images,
        tags: ["ISR", "On-demand", "Webhook", "Optimization"],
        timeStamp: new Date().toLocaleString('vi-VN')
      },
      // Giữ revalidate: false vì bạn dùng On-demand Revalidation (Webhook)
      revalidate: false 
    };
  } catch (error) {
    console.error("❌ ISR Fetch Error:", error.message);
    return { 
      props: { 
        posts: [], 
        images: [], 
        tags: [], 
        timeStamp: `Error at ${new Date().toLocaleString('vi-VN')}` 
      } 
    };
  }
}