import Head from 'next/head';
import Navbar from '../../components/Navbar';
import HomeSlider from '../../components/HomeSlider'; // 1. IMPORT SLIDER
import BlogGrid from '../../components/BlogGrid';
import MegaFooter from '../../components/MegaFooter';
import { enrichAndSortPosts, extractTags } from '../../lib/postUtils';

// 2. RECEIVE IMAGES IN PROPS
export default function SSGHomepage({ posts, images, timeStamp }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>Frozen SSG | Seminar UIT</title></Head>
      <Navbar />
      
      <div className="bg-rose-500 text-white px-6 py-1.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span>Trạng thái: SSG (Hóa thạch)</span>
        <span>Thời điểm Build: {timeStamp}</span>
      </div>

      {/* 3. ADD THE HERO SECTION TO MATCH OTHER PAGES */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-rose-900">
        <HomeSlider images={images} />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-rose-400">SSG RENDERING</h1>
          <p className="text-white font-mono bg-rose-700 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            Static Speed - No Updates
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="mb-10 border-l-8 border-rose-500 pl-6">
          <h1 className="text-3xl font-black text-slate-900 uppercase italic">Bản lưu trữ tĩnh</h1>
          <p className="text-slate-500 text-sm font-medium">Trang này sẽ KHÔNG bao giờ cập nhật để minh họa nhược điểm của SSG.</p>
        </div>

        <BlogGrid posts={posts} modeColor="rose" />
      </main>
      <MegaFooter tags={["SSG", "Frozen", "Static"]} />
    </div>
  );
}

export async function getStaticProps() {
  const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
  try {
    const res = await fetch(`${BACKEND_BASE}/api/posts`);
    
    // Add the safety check we discussed earlier!
    if (!res.ok) throw new Error("Backend fetch failed");
    
    const rawPosts = await res.json();
    const posts = enrichAndSortPosts(rawPosts);

    // 4. DEFINE THE IMAGES ARRAY
    const images = [
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg"
    ];

    return {
      props: {
        posts,
        images, // 5. PASS IMAGES TO PROPS
        timeStamp: new Date().toLocaleString('vi-VN')
      },
      // revalidate: false is what makes this pure SSG!
      revalidate: false 
    };
  } catch (error) {
    return { props: { posts: [], images: [], timeStamp: "Build Error" } };
  }
}