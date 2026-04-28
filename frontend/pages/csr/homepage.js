import React, { useState, useEffect, useRef } from 'react';
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
  cacheGet,
  cacheSet,
  getRenderModeMeta,
  smartSearchPosts,
  getLatestPosts,
  categoryFrequency,
} from '../../lib/postUtils';
import RenderBenchmark from '../../components/RenderBenchmark';

const CACHE_KEY = 'csr_posts_cache';
const CACHE_TTL = 60_000;

const SLIDER_IMAGES = [
  "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
  "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
  "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg",
];

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
                isActive(link.path) ? 'border-amber-500 bg-slate-800' : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}>
                <span className={`text-xs font-black tracking-widest ${isActive(link.path) ? 'text-amber-400' : ''}`}>{link.name}</span>
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
          <article className="h-full flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl border-b-4 hover:border-b-amber-500">
            <div className="flex justify-between items-start mb-4">
              <span className="text-amber-600 font-mono text-[10px] font-black uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">
                {post.category || 'General'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{post.formattedDate || post.publishedAt || post.date}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">{post.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-2 line-clamp-3">{post.shortExcerpt || post.excerpt}</p>
            {post.readingTime && (
              <p className="text-[10px] text-slate-400 font-mono mb-6">{post.readingTime}</p>
            )}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-amber-600 text-xs font-bold group-hover:underline flex items-center gap-2">
                READ MORE <span>&rarr;</span>
              </span>
              {post.relativeDate && (
                <span className="text-[9px] text-slate-400 font-mono">{post.relativeDate}</span>
              )}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

function InlinedMegaFooter({ tags, stats }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-8 border-amber-500 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-slate-700 pb-12">
          {stats && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-amber-500/30 pb-2 italic">
                Collection Stats
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total posts</span>
                  <span className="text-white font-mono font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Avg. reading time</span>
                  <span className="text-white font-mono font-bold">{stats.avgReadingMinutes} min</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Avg. word count</span>
                  <span className="text-white font-mono font-bold">{stats.avgWordCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          {stats?.categoryBreakdown && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-amber-500/30 pb-2 italic">
                Categories
              </h4>
              <div className="space-y-2">
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-xs">
                    <span className="text-slate-400">{cat}</span>
                    <span className="text-amber-400 font-mono font-bold">{count} bài</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-amber-500/30 pb-2 italic">
              Key Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, idx) => (
                <span key={idx} className="bg-slate-800/50 border border-slate-700 text-[10px] px-3 py-1.5 rounded hover:border-amber-500 hover:bg-amber-500 hover:text-slate-900 transition-all font-mono uppercase cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] opacity-50 font-mono">
          <div className="flex gap-4">
            <span>© 2026 UIT SEMINAR</span>
            <span className="text-amber-500 animate-pulse">●</span>
            <span>NEXT.JS v14.2 STABLE</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
            <Link href="/docs/hybrid" className="hover:text-amber-400 transition-colors uppercase">Giới thiệu</Link>
            <Link href="/docs/menn-flow" className="hover:text-amber-400 transition-colors uppercase">Lý thuyết</Link>
            <Link href="/docs/vitals" className="hover:text-amber-400 transition-colors uppercase">Thực nghiệm</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function CSRPage() {
  const [ready, setReady]           = useState(false);
  const [posts, setPosts]           = useState([]);
  const [tags, setTags]             = useState([]);
  const [stats, setStats]           = useState(null);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    const bootstrap = async () => {
      try {
        const cached = cacheGet(CACHE_KEY);
        let rawPosts = cached;

        if (!rawPosts) {
          const res = await fetch('/api/blog-proxy');
          if (!res.ok) throw new Error('Proxy fetch failed');
          rawPosts = await res.json();
          cacheSet(CACHE_KEY, rawPosts, CACHE_TTL);
        }

        const enriched    = enrichAndSortPosts(rawPosts);
        const derivedTags = extractTags(enriched);
        const postStats   = computePostStats(rawPosts);

        setPosts(enriched);
        setStats(postStats);
        setTags(['CSR', 'Proxy', 'BFF', 'Security', 'Browser-Fetch', ...derivedTags]);
        setRenderTime((performance.now() - startTime).toFixed(0));
        setReady(true);
      } catch (err) {
        console.error('CSR bootstrap error:', err);
        setReady(true);
      }
    };

    bootstrap();
  }, []);

  const pageTitle = buildPageTitle(
    ready ? 'CSR Mode (Secure Proxy)' : 'CSR Mode (Loading...)',
    'Blog HCM'
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <InlinedNavbar />

      <RenderBenchmark mode="CSR" />

      {!ready ? (
        <>
          <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-200 animate-pulse">
            <div className="relative z-10 text-center px-4 w-full max-w-2xl">
              <div className="h-16 bg-slate-300 rounded-lg mb-4 w-3/4 mx-auto" />
              <div className="h-6 bg-slate-300 rounded mx-auto w-1/2" />
            </div>
          </section>

          <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
            <div className="mb-10 pl-6 border-l-8 border-slate-300">
              <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="w-16 h-4 bg-slate-200 rounded" />
                    <div className="w-20 h-4 bg-slate-200 rounded" />
                  </div>
                  <div className="w-full h-6 bg-slate-200 rounded mb-2" />
                  <div className="w-3/4 h-6 bg-slate-200 rounded mb-6" />
                  <div className="w-full h-4 bg-slate-100 rounded mb-2" />
                  <div className="w-full h-4 bg-slate-100 rounded mb-2" />
                  <div className="w-2/3 h-4 bg-slate-100 rounded mt-auto" />
                </div>
              ))}
            </div>
          </main>
        </>
      ) : (
        <>
          <div className="bg-amber-500 text-slate-900 px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              <span>Mode: Client-Side Rendering (via Proxy)</span>
            </div>
            <span>Hydrated in {formatDuration(Number(renderTime))} · Backend IP Hidden 🛡️</span>
          </div>

          <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
            <InlinedHomeSlider images={SLIDER_IMAGES} />
            <div className="relative z-10 text-center text-white px-4">
              <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-amber-400 uppercase">
                CSR RENDERING
              </h1>
              <p className="text-white font-mono bg-amber-600/90 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
                Hydrated in {formatDuration(Number(renderTime))}
              </p>
            </div>
          </section>

          <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
            <div className="flex items-center justify-between mb-10 border-l-8 border-amber-500 pl-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">
                  Bài viết (Secure CSR)
                </h2>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  FETCHING FLOW: Browser ➔ Next.js Proxy ➔ Express Backend
                </p>
              </div>
              <span className="hidden md:block text-[10px] font-mono text-amber-700 bg-amber-100 px-3 py-1 rounded border border-amber-200 font-bold uppercase">
                Fat Bundle Executed
              </span>
            </div>

            <InlinedBlogGrid posts={posts} />
          </main>

          <InlinedMegaFooter tags={tags} stats={stats} />
        </>
      )}
    </div>
  );
}