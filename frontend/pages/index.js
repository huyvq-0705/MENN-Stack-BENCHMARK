import Head from 'next/head';
import Navbar from '../components/HomeNavbar';
import HomeSlider from '../components/HomeSlider';
import BlogGrid from '../components/BlogGrid';
import MegaFooter from '../components/MegaFooter';

export default function Homepage({ posts, images, tags }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head>
        <title>Saigon Blog | Explore Ho Chi Minh City</title>
        <meta name="description" content="Discover the best destinations, food, and culture in Saigon." />
      </Head>

      <Navbar />

      {/* Hero Section - Đồng bộ h-[55vh] như trang ISR */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <HomeSlider images={images} />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl uppercase">
            Discover Saigon
          </h1>
          <p className="text-base md:text-lg font-light tracking-wide drop-shadow-md opacity-90 max-w-2xl mx-auto italic">
            From the historic Dinh Độc Lập to the hidden cafes of District 1, 
            journey through the heart of Vietnam's most vibrant city.
          </p>
        </div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      </section>

      {/* Featured Content Area - Đồng bộ max-w-6xl và py-16 */}
      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        
        {/* Header Section - Layout y hệt bản ISR nhưng dùng màu Slate chuyên nghiệp */}
        <div className="flex items-center justify-between mb-10 border-l-8 border-slate-900 pl-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">
              Latest Stories
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest">
              Explore the heart of Vietnam
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded border border-emerald-100 uppercase tracking-tighter">
              Updated Real-time
            </span>
          </div>
        </div>

        {/* Blog Grid với màu Slate để trang nhã */}
        <BlogGrid posts={posts} modeColor="slate" />
        
      </main>

      <MegaFooter tags={tags} />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const res = await fetch(`${BACKEND_BASE}/api/posts`);
    const posts = await res.json();

    const images = [
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
      "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg"
    ];

    const tags = ["Saigon", "Travel", "Culture", "History", "Food", "District 1"];

    return {
      props: { posts, images, tags },
      revalidate: false, // On-demand ISR
    };
  } catch (error) {
    console.error("ISR Production Homepage Error:", error);
    return { props: { posts: [], images: [], tags: [] } };
  }
}