import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  enrichAndSortPosts,
  extractTags,
  computePostStats,
  formatDuration,
  buildPageTitle,
  getRenderModeMeta,
} from '../../lib/postUtils';
import RenderBenchmark from '../../components/RenderBenchmark';

function InlinedNavbar() {
  const router = useRouter();
  const isActive = (path) => router.pathname.includes(path);
  const navLinks = [
    { name: 'SSG', path: '/ssg/homepage', desc: 'Static' },
    { name: 'SSR', path: '/ssr/homepage', desc: 'Server' },
    { name: 'ISR', path: '/isr/homepage', desc: 'Hybrid' },
    { name: 'CSR', path: '/csr/homepage', desc: 'Client' },
  ];
  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-900 group-hover:rotate-12 transition-transform">SG</div>
          <span className="text-white font-bold tracking-tighter text-xl">Sài Gòn Blog</span>
        </Link>
        <div className="flex gap-1 md:gap-4">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path}>
              <div className={`px-3 py-2 rounded-md transition-all duration-200 flex flex-col items-center border-b-2 ${
                isActive(link.path) ? 'border-blue-500 bg-slate-800' : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}>
                <span className={`text-xs font-black tracking-widest ${isActive(link.path) ? 'text-blue-400' : ''}`}>{link.name}</span>
                <span className="text-[10px] opacity-50 uppercase hidden md:block">{link.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function InlinedHomeSlider({ images }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % images.length), 3000);
    return () => clearInterval(timer);
  }, [images?.length]);
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-900">
      {images?.map((img, i) => (
        <div key={img} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}>
          <Image src={img} alt={`Saigon Landmark ${i + 1}`} fill sizes="100vw" style={{ objectFit: 'cover' }} className="opacity-50" priority={i === 0} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
    </div>
  );
}

function InlinedBlogGrid({ posts }) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
        <p className="text-slate-500 font-mono italic">No posts found in Database.</p>
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link key={post._id || post.id} href={`/posts/${post.slug}`} className="block group">
          <article className="h-full flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl border-b-4 hover:border-b-blue-500">
            <div className="flex justify-between items-start mb-4">
              <span className="text-blue-600 font-mono text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                {post.category || 'General'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{post.formattedDate || post.publishedAt}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-2 line-clamp-3">{post.shortExcerpt || post.excerpt}</p>
            {post.readingTime && <p className="text-[10px] text-slate-400 font-mono mb-6">{post.readingTime}</p>}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-blue-600 text-xs font-bold group-hover:underline flex items-center gap-2">READ MORE <span>&rarr;</span></span>
              {post.relativeDate && <span className="text-[9px] text-slate-400 font-mono">{post.relativeDate}</span>}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

function InlinedMegaFooter({ tags, stats }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-8 border-blue-500 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-slate-700 pb-12">
          {stats && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-blue-500/30 pb-2 italic">Collection Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-400">Total posts</span><span className="text-white font-mono font-bold">{stats.total}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Avg. reading time</span><span className="text-white font-mono font-bold">{stats.avgReadingMinutes} min</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Avg. word count</span><span className="text-white font-mono font-bold">{stats.avgWordCount.toLocaleString()}</span></div>
              </div>
            </div>
          )}
          {stats?.categoryBreakdown && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-blue-500/30 pb-2 italic">Categories</h4>
              <div className="space-y-2">
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-xs">
                    <span className="text-slate-400">{cat}</span>
                    <span className="text-blue-400 font-mono font-bold">{count} bài</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-blue-500/30 pb-2 italic">Key Concepts</h4>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, idx) => (
                <span key={idx} className="bg-slate-800/50 border border-slate-700 text-[10px] px-3 py-1.5 rounded hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all font-mono uppercase cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] opacity-50 font-mono">
          <div className="flex gap-4">
            <span>© 2026 UIT SEMINAR</span>
            <span className="text-blue-500 animate-pulse">●</span>
            <span>NEXT.JS v14.2 STABLE</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
            <Link href="/seminar/introduction" className="hover:text-amber-400 transition-colors uppercase">Giới thiệu</Link>
            <Link href="/seminar/theory" className="hover:text-amber-400 transition-colors uppercase">Lý thuyết</Link>
            <Link href="/seminar/experiment" className="hover:text-amber-400 transition-colors uppercase">Thực nghiệm</Link>
            <Link href="/seminar/result" className="hover:text-amber-400 transition-colors uppercase">Kết Quả</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ISRPage({ posts, images, tags, timeStamp, stats }) {
  const siteTitle = "Saigon Blog | Explore Ho Chi Minh City";
  const siteDescription = "Discover the best destinations, food, and culture in Saigon. From the historic Dinh Độc Lập to the hidden cafes of District 1, journey through the heart of Vietnam's most vibrant city.";
  const siteUrl = "https://ie213saigonblog.online"; 
  const defaultImage = "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Logo.webp"

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head>
        <title>{buildPageTitle('SaiGon Blog ISR')}</title>
        <meta name="description" content="Demo ISR rendering — tốc độ tĩnh, cập nhật on-demand qua webhook." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={siteUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={defaultImage} />
        <meta property="og:site_name" content="Saigon Blog" />
        <meta property="og:locale" content="vi_VN" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={defaultImage} />
      </Head>

      <InlinedNavbar />
      
      <RenderBenchmark mode="ISR" />

      <div className="bg-blue-600 text-white px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Mode: On-demand ISR — Waiting for Webhook</span>
        </div>
        <span>Last built: {timeStamp}</span>
      </div>

      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <InlinedHomeSlider images={images} />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-blue-400 uppercase">ISR RENDERING</h1>
          <p className="text-white font-mono bg-blue-700/90 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            Static Speed + On-demand Updates
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="flex items-center justify-between mb-10 border-l-8 border-blue-500 pl-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">Bài viết (Hybrid)</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1 animate-pulse">
              Waiting for Webhook to trigger regeneration...
            </p>
          </div>
          <span className="hidden md:block text-[10px] font-mono text-blue-700 bg-blue-100 px-3 py-1 rounded border border-blue-200 font-bold uppercase">
            Cache: HIT
          </span>
        </div>
        <InlinedBlogGrid posts={posts} />
      </main>

      <InlinedMegaFooter tags={tags} stats={stats} />
    </div>
  );
}

export async function getStaticProps() {
  console.log('🛠️ Next.js is building (or re-building) the ISR page...');
  const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
  try {
    const res = await fetch(`${BACKEND_BASE}/api/posts`);
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
    const rawPosts = await res.json();
    const posts    = enrichAndSortPosts(rawPosts);
    const tags     = extractTags(posts);
    const stats    = computePostStats(rawPosts);
    return {
      props: {
        posts,
        stats,
        images: [
          'https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg',
          'https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg',
          'https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg',
        ],
        tags:      ['ISR', 'On-demand', 'Webhook', 'Hybrid', 'Cache', ...tags],
        timeStamp: new Date().toLocaleString('vi-VN'),
      },
      revalidate: false, 
    };
  } catch (error) {
    console.error('❌ ISR Fetch Error:', error.message);
    return {
      props: { posts: [], images: [], tags: [], stats: null, timeStamp: `Error at ${new Date().toLocaleString('vi-VN')}` },
    };
  }
}