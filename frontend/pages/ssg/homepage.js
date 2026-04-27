import Head from 'next/head';
import Navbar from '../../components/Navbar';
import BlogGrid from '../../components/BlogGrid';
import MegaFooter from '../../components/MegaFooter';
import { enrichAndSortPosts, extractTags } from '../../lib/postUtils';

export default function SSGHomepage({ posts, timeStamp }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Head><title>Frozen SSG | Seminar UIT</title></Head>
      <Navbar />
      
      {/* Banner thông báo trạng thái đóng băng */}
      <div className="bg-rose-500 text-white px-6 py-1.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span>Trạng thái: SSG (Hóa thạch)</span>
        <span>Thời điểm Build: {timeStamp}</span>
      </div>

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
    const rawPosts = await res.json();
    // Enrich posts using the shared utility — same code path as CSR.
    const posts = enrichAndSortPosts(rawPosts);

    return {
      props: {
        posts,
        timeStamp: new Date().toLocaleString('vi-VN')
      },
      revalidate: false 
    };
  } catch (error) {
    return { props: { posts: [], timeStamp: "Build Error" } };
  }
}