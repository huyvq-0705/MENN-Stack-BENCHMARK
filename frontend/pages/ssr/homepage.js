import Head from 'next/head';
import Navbar from '../../components/Navbar';
import HomeSlider from '../../components/HomeSlider';
import MegaFooter from '../../components/MegaFooter';
import BlogGrid from '../../components/BlogGrid';
import { enrichAndSortPosts, extractTags } from '../../lib/postUtils';

export default function SSRPage({ posts, images, tags, timeStamp }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head><title>SSR Mode | Blog HCM</title></Head>
      <Navbar />
      
      <div className="bg-rose-500 text-white px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
        <span>Mode: Server-Side Rendering (SSR)</span>
        <span>Requested at: {timeStamp}</span>
      </div>

      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <HomeSlider images={images} />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-rose-400">SSR RENDERING</h1>
          <p className="text-white font-mono bg-rose-600 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            Real-time Data - Slower Performance
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="flex items-center justify-between mb-10 border-l-8 border-rose-500 pl-6">
          <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">
            Bài viết (Dynamic)
          </h2>
          <span className="text-[10px] font-mono text-rose-600 font-bold uppercase">Latency: 2000ms (Simulated)</span>
        </div>

        <BlogGrid posts={posts} modeColor="rose" />
        
      </main>

      <MegaFooter tags={tags} />
    </div>
  );
}

export async function getServerSideProps() {

  try {
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const res = await fetch(`${BACKEND_BASE}/api/posts`);
    const rawPosts = await res.json();
    // Enrich posts using the shared utility — same code path as CSR.
    const posts = enrichAndSortPosts(rawPosts);
    const derivedTags = extractTags(posts);

    const images = [
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg"
    ];

    return {
      props: {
        posts,
        images,
        tags: ["Realtime", "Server", "Dynamic", "Performance", ...derivedTags],
        timeStamp: new Date().toLocaleString('vi-VN')
      }
    };
  } catch (error) {
    return { props: { posts: [], images: [], tags: [], timeStamp: "Error" } };
  }
}