import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import HomeSlider from '../../components/HomeSlider';
import MegaFooter from '../../components/MegaFooter';
import BlogGrid from '../../components/BlogGrid';
import {
  enrichAndSortPosts,
  extractTags,
  preloadImages,
} from '../../lib/postUtils';

// Slider images are defined at module scope so they are part of the JS bundle
// evaluation cost — identical to what ISR/SSR/SSG receive as static props.
const SLIDER_IMAGES = [
  "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
  "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
  "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg",
];

export default function CSRPage() {
  // Nothing is shown to the user until BOTH posts AND images are ready.
  // This is the fundamental CSR trade-off: the browser must download the JS
  // bundle, execute it, fetch data, and fetch/decode images before any
  // meaningful content appears — resulting in a poor LCP score.
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    const bootstrap = async () => {
      try {
        // Step 1 — Fetch post data via the Next.js BFF proxy.
        // The browser cannot call the Express backend directly (CORS + security),
        // so the request must round-trip through Next.js first.
        const res = await fetch('/api/blog-proxy');
        if (!res.ok) throw new Error('Proxy fetch failed');
        const rawPosts = await res.json();

        // Step 2 — Enrich posts with derived display fields (reading time,
        // formatted dates, excerpts) using the shared postUtils library.
        const enriched = enrichAndSortPosts(rawPosts);
        const derivedTags = extractTags(enriched);

    

        // Step 4 — All assets are ready. Commit to state in a single batch
        // so React performs only one re-render, revealing the full page.
        setPosts(enriched);
        setTags(['CSR', 'Proxy', 'BFF', 'Security', 'Browser-Fetch', ...derivedTags]);
        setRenderTime((performance.now() - startTime).toFixed(0));
        setReady(true);
      } catch (err) {
        console.error('CSR bootstrap error:', err);
        // On error, unblock the page with empty state so the user isn't
        // stuck on a loading screen indefinitely.
        setReady(true);
      }
    };

    bootstrap();
  }, []);

  // ─── Full-page loading screen ───────────────────────────────────────────────
  // Shown while the JS bundle runs, data is fetched, and images are preloaded.
  // A plain spinner is used — no animation libraries, no skeleton UI —
  // to keep this as a neutral, honest loading indicator.
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <Head><title>CSR Mode (Loading...) | Blog HCM</title></Head>

        {/* Standard CSS spinner — no external dependencies */}
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid #334155',
            borderTopColor: '#f59e0b',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />

        {/* Inline keyframe — avoids needing a separate CSS file */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div className="text-center">
          <p className="text-amber-400 text-xs font-mono font-bold tracking-widest uppercase">
            Client-Side Rendering
          </p>
          <p className="text-slate-500 text-[10px] font-mono mt-1 tracking-widest">
            Đang tải dữ liệu từ Proxy...
          </p>
        </div>
      </div>
    );
  }

  // ─── Full page — rendered only after all data and images are ready ──────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head><title>CSR Mode (Secure Proxy) | Blog HCM</title></Head>
      <Navbar />

      {/* Status bar */}
      <div className="bg-amber-500 text-slate-900 px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span>Mode: Client-Side Rendering (via Proxy)</span>
        </div>
        <span>Security: Backend IP Hidden 🛡️</span>
      </div>

      {/* Hero Section */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <HomeSlider images={SLIDER_IMAGES} />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-amber-400 uppercase">
            CSR RENDERING
          </h1>
          <p className="text-white font-mono bg-amber-600/90 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            Hydrated in {renderTime}ms
          </p>
        </div>
      </section>

      {/* Main Content */}
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
            CORS: Avoided
          </span>
        </div>

        <BlogGrid posts={posts} modeColor="amber" />
      </main>

      <MegaFooter tags={tags} />
    </div>
  );
}