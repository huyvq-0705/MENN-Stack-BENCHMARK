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
  getRenderModeMeta,
  categoryFrequency,
} from '../../lib/postUtils';

// ─── Benchmark constants ───────────────────────────────────────────────────────
// Identical to CSR page — same token in both bundles, fair comparison.

const MODE_COLORS = {
  SSG: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', light: 'bg-emerald-50', dark: 'text-emerald-600' },
  SSR: { bg: 'bg-rose-500',    text: 'text-rose-400',    border: 'border-rose-500',    light: 'bg-rose-50',    dark: 'text-rose-600'    },
  ISR: { bg: 'bg-blue-500',    text: 'text-blue-400',    border: 'border-blue-500',    light: 'bg-blue-50',    dark: 'text-blue-600'    },
  CSR: { bg: 'bg-amber-500',   text: 'text-amber-400',   border: 'border-amber-500',   light: 'bg-amber-50',   dark: 'text-amber-600'   },
};

const THRESHOLDS = {
  FCP:  { good: 1800, poor: 3000 },
  LCP:  { good: 2500, poor: 4000 },
  TBT:  { good: 200,  poor: 600  },
  TTFB: { good: 800,  poor: 1800 },
  HYD:  { good: 300,  poor: 1000 },
};

function getRating(metric, value) {
  if (value === null || value === undefined) return null;
  const t = THRESHOLDS[metric];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

const RATING_STYLES = {
  'good':              { label: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  'needs-improvement': { label: 'Fair', color: 'text-amber-600',   bg: 'bg-amber-100',   dot: 'bg-amber-500'   },
  'poor':              { label: 'Poor', color: 'text-red-600',     bg: 'bg-red-100',     dot: 'bg-red-500'     },
};

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, unit = 'ms', metric, description, highlight }) {
  const rating = getRating(metric, value);
  const rs = rating ? RATING_STYLES[rating] : null;
  const displayValue = value !== null && value !== undefined ? Math.round(value) : '—';

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col gap-2 ${highlight ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono">{label}</span>
        {rs && (
          <span className={`text-[8px] font-black tracking-[0.15em] uppercase px-2 py-0.5 rounded-full ${rs.color} ${rs.bg} flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
            {rs.label}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-black text-slate-900 tabular-nums leading-none">
          {displayValue === '—' ? '—' : displayValue.toLocaleString()}
        </span>
        {displayValue !== '—' && (
          <span className="text-xs text-slate-400 font-mono mb-0.5">{unit}</span>
        )}
      </div>
      {value !== null && value !== undefined && THRESHOLDS[metric] && (
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              rating === 'good' ? 'bg-emerald-500' :
              rating === 'needs-improvement' ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((value / THRESHOLDS[metric].poor) * 100, 100)}%` }}
          />
        </div>
      )}
      <p className="text-[9px] text-slate-400 leading-relaxed">{description}</p>
      {highlight && (
        <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest mt-1">
          ← SSR bottleneck
        </p>
      )}
    </div>
  );
}

// ─── RenderBenchmark ──────────────────────────────────────────────────────────
// SSR-specific: highlights TTFB as the key metric because that's where SSR
// pays its real cost — the server must query the DB and render HTML before
// sending byte 1. FCP/LCP are good because HTML arrives pre-rendered.

function RenderBenchmark({ mode = 'SSR', serverMs }) {
  const colors = MODE_COLORS[mode] || MODE_COLORS.SSR;
  const meta   = getRenderModeMeta(mode);
  const mountRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0);

  const [metrics, setMetrics]   = useState({ fcp: null, lcp: null, tbt: null, ttfb: null, hyd: null });
  const [collecting, setCollecting] = useState(true);
  const [expanded, setExpanded]     = useState(false);

  useEffect(() => {
    if (typeof performance === 'undefined') return;

    // Hydration time: how long React took to attach event listeners to the
    // server-rendered HTML. For SSR this is fast because the DOM is already there.
    const hydrationTime = performance.now() - mountRef.current;
    const collected = { hyd: hydrationTime };

    // TTFB: measured from the NavigationTiming API — this is the honest number.
    // For SSR it includes: DNS + TCP + TLS + server render time + DB query.
    // This is SSR's real trade-off vs SSG (which has near-zero server compute).
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) collected.ttfb = navEntry.responseStart - navEntry.requestStart;

    let fcpDone = false, lcpDone = false;
    const checkDone = () => { if (fcpDone && lcpDone) setCollecting(false); };

    try {
      const fcpObs = new PerformanceObserver((list) => {
        const fcp = list.getEntries().find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          // SSR's FCP is usually very good — the browser can paint HTML
          // immediately on first parse without waiting for JS.
          setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
          fcpDone = true; checkDone(); fcpObs.disconnect();
        }
      });
      fcpObs.observe({ type: 'paint', buffered: true });
    } catch { fcpDone = true; }

    try {
      const lcpObs = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) setMetrics(prev => ({ ...prev, lcp: last.startTime }));
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      const finaliseLcp = () => { lcpDone = true; checkDone(); lcpObs.disconnect(); };
      setTimeout(finaliseLcp, 5000);
      ['click', 'keydown', 'scroll'].forEach(e =>
        window.addEventListener(e, finaliseLcp, { once: true })
      );
    } catch { lcpDone = true; }

    let tbt = 0;
    try {
      const tbtObs = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => { tbt += Math.max(0, entry.duration - 50); });
        setMetrics(prev => ({ ...prev, tbt: Math.max(tbt, 0) }));
      });
      tbtObs.observe({ type: 'longtask', buffered: true });
      setTimeout(() => tbtObs.disconnect(), 8000);
    } catch {}

    setMetrics(prev => ({ ...prev, ...collected }));
    const timeout = setTimeout(() => setCollecting(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  // Weighted performance score — same formula as CSR page for fair comparison.
  const scoreMetrics = [
    { v: metrics.fcp,  w: 0.25, t: THRESHOLDS.FCP  },
    { v: metrics.lcp,  w: 0.35, t: THRESHOLDS.LCP  },
    { v: metrics.tbt,  w: 0.25, t: THRESHOLDS.TBT  },
    { v: metrics.ttfb, w: 0.15, t: THRESHOLDS.TTFB },
  ];
  const available = scoreMetrics.filter(m => m.v !== null);
  const score = available.length > 0
    ? Math.round(available.reduce((acc, m) => {
        const ratio = Math.min(m.v / m.t.poor, 1);
        return acc + (1 - ratio) * (m.w / available.reduce((s, x) => s + x.w, 0));
      }, 0) * 100)
    : null;
  const scoreColor = score === null ? 'text-slate-400'
    : score >= 90 ? 'text-emerald-500'
    : score >= 50 ? 'text-amber-500'
    : 'text-red-500';

  return (
    <div className={`border-t-4 ${colors.border} bg-slate-50 relative z-40`}>
      <div
        className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`${colors.bg} text-white text-[9px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded`}>{mode}</div>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-500">Performance Benchmark</span>
          {collecting && (
            <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Measuring...
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Score</span>
              <span className={`text-xl font-black tabular-nums ${scoreColor}`}>{score}</span>
              <span className="text-[9px] text-slate-300">/100</span>
            </div>
          )}
          <div className="hidden md:flex items-center gap-3 text-[9px] font-mono text-slate-500">
            {metrics.fcp  !== null && <span>FCP  <b className="text-slate-700">{Math.round(metrics.fcp)}ms</b></span>}
            {metrics.lcp  !== null && <span>LCP  <b className="text-slate-700">{Math.round(metrics.lcp)}ms</b></span>}
            {metrics.ttfb !== null && <span>TTFB <b className="text-rose-600">{Math.round(metrics.ttfb)}ms</b></span>}
          </div>
          <span className="text-slate-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="max-w-6xl mx-auto px-6 pb-8">

          {/* Mode description from RENDER_MODE_META in postUtils */}
          <div className={`${colors.light} border ${colors.border} border-opacity-30 rounded-xl p-4 mb-4 text-xs`}>
            <p className={`font-black uppercase tracking-[0.15em] text-[9px] ${colors.dark} mb-1`}>
              {meta.fullName}
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">{meta.description}</p>
            <div className="flex gap-6">
              <div>
                <p className="text-[8px] font-black tracking-widest text-emerald-600 uppercase mb-1">Pros</p>
                <ul className="space-y-0.5">
                  {meta.pros.map(p => (
                    <li key={p} className="text-[9px] text-slate-500 flex items-center gap-1">
                      <span className="text-emerald-500">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[8px] font-black tracking-widest text-red-500 uppercase mb-1">Cons</p>
                <ul className="space-y-0.5">
                  {meta.cons.map(c => (
                    <li key={c} className="text-[9px] text-slate-500 flex items-center gap-1">
                      <span className="text-red-400">✕</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Metric cards — TTFB is highlighted as the SSR-specific bottleneck */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <MetricCard
              label="FCP" metric="FCP" value={metrics.fcp}
              description="First Contentful Paint — thấp vì HTML đã có sẵn từ server, browser vẽ ngay."
            />
            <MetricCard
              label="LCP" metric="LCP" value={metrics.lcp}
              description="Largest Contentful Paint — tốt vì ảnh hero đã có trong HTML, không cần chờ JS."
            />
            <MetricCard
              label="TBT" metric="TBT" value={metrics.tbt}
              description="Total Blocking Time — JS bundle hydrate DOM nhưng không block initial paint."
            />
            <MetricCard
              label="TTFB" metric="TTFB" value={metrics.ttfb}
              highlight={true}
              description="Time to First Byte — SSR phải chờ server query DB + render HTML trước khi gửi byte đầu tiên."
            />
            <MetricCard
              label="Hydration" metric="HYD" value={metrics.hyd}
              description="Thời gian React attach event listeners vào DOM có sẵn từ server."
            />
          </div>

          {/* Server render time — the honest SSR cost, shown prominently */}
          <div className="bg-slate-800 text-white rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Server Render Time (getServerSideProps)
                </p>
                <p className="text-2xl font-black tabular-nums">
                  {serverMs != null ? `${serverMs}` : '—'}
                  <span className="text-sm text-slate-400 font-mono ml-1">ms</span>
                </p>
              </div>
              <div className="text-right max-w-xs">
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  Thời gian server cần để: fetch từ MongoDB → enrich posts → render HTML → gửi về browser.
                  Đây là chi phí thực của SSR trên mỗi request — so sánh với SSG/ISR (0ms server cost per request).
                </p>
                {serverMs != null && (
                  <div className="mt-2">
                    <div className="h-1 bg-slate-600 rounded-full overflow-hidden w-full">
                      <div
                        className={`h-full rounded-full ${serverMs < 500 ? 'bg-emerald-500' : serverMs < 1500 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min((serverMs / 3000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-slate-500 mt-1">
                      {serverMs < 500 ? 'Fast server' : serverMs < 1500 ? 'Moderate server load' : 'Slow — DB bottleneck'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SSR flow diagram — text-based, no external deps */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">SSR Request Flow</p>
              <div className="flex items-center gap-1 flex-wrap text-[9px] font-mono">
                {[
                  { label: 'Browser', color: 'bg-slate-600' },
                  { label: '→' },
                  { label: 'Next.js Server', color: 'bg-rose-800' },
                  { label: '→' },
                  { label: 'Express API', color: 'bg-rose-700' },
                  { label: '→' },
                  { label: 'MongoDB', color: 'bg-rose-600' },
                  { label: '→' },
                  { label: 'Render HTML', color: 'bg-rose-500' },
                  { label: '→' },
                  { label: 'Send', color: 'bg-slate-600' },
                ].map((step, i) =>
                  step.color
                    ? <span key={i} className={`${step.color} text-white px-2 py-0.5 rounded text-[8px]`}>{step.label}</span>
                    : <span key={i} className="text-slate-500">{step.label}</span>
                )}
              </div>
              <p className="text-[8px] text-slate-500 mt-1">
                User nhìn thấy blank screen trong toàn bộ thời gian này → TTFB cao hơn SSG/ISR.
              </p>
            </div>
          </div>

          {/* Estimated score */}
          {score !== null && (
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono">Estimated Lighthouse Score</span>
                <span className={`text-lg font-black ${scoreColor}`}>{score}/100</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${score >= 90 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-2">
                * Ước tính dựa trên FCP, LCP, TBT, TTFB được đo thực tế. SSR thường score cao hơn CSR nhờ FCP/LCP tốt,
                nhưng thấp hơn SSG/ISR do TTFB. Không phải điểm Lighthouse chính thức.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inlined components ───────────────────────────────────────────────────────
// Identical copies to the CSR page — ensuring the JS chunk sizes are equal.
// Next.js will NOT code-split these since they're defined in the same file.
// This is the same bundle-equalisation strategy as CSR, applied to SSR.
// Effect on SSR metrics: slightly higher TBT (heavier hydration JS),
// but does NOT affect FCP or LCP since HTML is already server-rendered.

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
                isActive(link.path) ? 'border-rose-500 bg-slate-800' : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}>
                <span className={`text-xs font-black tracking-widest ${isActive(link.path) ? 'text-rose-400' : ''}`}>{link.name}</span>
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
          <Image
            src={img}
            alt={`Saigon Landmark ${i + 1}`}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className="opacity-50"
            priority={i === 0}
          />
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
          <article className="h-full flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl border-b-4 hover:border-b-rose-500">
            <div className="flex justify-between items-start mb-4">
              <span className="text-rose-600 font-mono text-[10px] font-black uppercase tracking-widest bg-rose-50 px-2 py-1 rounded">
                {post.category || 'General'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{post.formattedDate || post.publishedAt || post.date}</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2">{post.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-2 line-clamp-3">{post.shortExcerpt || post.excerpt}</p>
            {post.readingTime && (
              <p className="text-[10px] text-slate-400 font-mono mb-6">{post.readingTime}</p>
            )}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-rose-600 text-xs font-bold group-hover:underline flex items-center gap-2">
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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-8 border-rose-500 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-slate-700 pb-12">
          {stats && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-rose-500/30 pb-2 italic">
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
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-rose-500/30 pb-2 italic">
                Categories
              </h4>
              <div className="space-y-2">
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-xs">
                    <span className="text-slate-400">{cat}</span>
                    <span className="text-rose-400 font-mono font-bold">{count} bài</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-[0.2em] border-b border-rose-500/30 pb-2 italic">
              Key Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, idx) => (
                <span key={idx} className="bg-slate-800/50 border border-slate-700 text-[10px] px-3 py-1.5 rounded hover:border-rose-500 hover:bg-rose-500 hover:text-white transition-all font-mono uppercase cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] opacity-50 font-mono">
          <div className="flex gap-4">
            <span>© 2026 UIT SEMINAR</span>
            <span className="text-rose-500 animate-pulse">●</span>
            <span>NEXT.JS v14.2 STABLE</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
            <Link href="/docs/hybrid"    className="hover:text-rose-400 transition-colors uppercase">Giới thiệu</Link>
            <Link href="/docs/menn-flow" className="hover:text-rose-400 transition-colors uppercase">Lý thuyết</Link>
            <Link href="/docs/vitals"    className="hover:text-rose-400 transition-colors uppercase">Thực nghiệm</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SSRPage({ posts, images, tags, timeStamp, serverMs, stats }) {
  const pageTitle = buildPageTitle('Saigon Blog SSR');
  const siteTitle = "Saigon Blog | Explore Ho Chi Minh City";
  const siteDescription = "Discover the best destinations, food, and culture in Saigon. From the historic Dinh Độc Lập to the hidden cafes of District 1, journey through the heart of Vietnam's most vibrant city.";
  const siteUrl = "https://ie213saigonblog.online"; 
  const defaultImage = "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Logo.webp"


  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head>
        {/*
          Unlike CSR, these meta tags ARE visible to Googlebot immediately —
          the server sent them inside the HTML response before JS ran.
          This is one of SSR's genuine advantages over CSR for SEO.
        */}
        <title>{pageTitle}</title>
        <meta name="description" content="Demo SSR rendering — dữ liệu thực, render mỗi request, TTFB cao hơn SSG." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={siteUrl} />

        {/* Open Graph / Facebook / Zalo */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={defaultImage} />
        <meta property="og:site_name" content="Saigon Blog" />
        <meta property="og:locale" content="vi_VN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={defaultImage} />
      </Head>

      <InlinedNavbar />

      {/* Benchmark — below navbar, always visible */}
      <RenderBenchmark mode="SSR" serverMs={serverMs} />

      {/* Status bar */}
      <div className="bg-rose-500 text-white px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Mode: Server-Side Rendering</span>
        </div>
        <span>Rendered at: {timeStamp} · Server cost: {formatDuration(serverMs)}</span>
      </div>

      {/* Hero — images are IN the HTML, so browser fetches them during parse.
          This is why SSR LCP is much better than CSR. */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <InlinedHomeSlider images={images} />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl text-rose-400 uppercase">
            SSR RENDERING
          </h1>
          <p className="text-white font-mono bg-rose-600/90 inline-block px-4 py-1 rounded tracking-widest uppercase text-xs">
            Real-time data · Server cost: {formatDuration(serverMs)}
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="flex items-center justify-between mb-10 border-l-8 border-rose-500 pl-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 italic uppercase tracking-tighter">
              Bài viết (Dynamic)
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              FLOW: Browser → Next.js getServerSideProps → MongoDB → Render HTML → Send
            </p>
          </div>
          <span className="hidden md:block text-[10px] font-mono text-rose-700 bg-rose-100 px-3 py-1 rounded border border-rose-200 font-bold uppercase">
            Per-request render
          </span>
        </div>

        <InlinedBlogGrid posts={posts} />
      </main>

      <InlinedMegaFooter tags={tags} stats={stats} />
    </div>
  );
}

// ─── getServerSideProps ───────────────────────────────────────────────────────
// This runs on the SERVER for every single request.
// The timer here measures the real SSR cost: DB fetch + post enrichment.
// This number directly becomes TTFB overhead (on top of network RTT).

export async function getServerSideProps() {
  const serverStart = Date.now();

  try {
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const res = await fetch(`${BACKEND_BASE}/api/posts`);
    if (!res.ok) throw new Error(`Backend responded ${res.status}`);

    const rawPosts = await res.json();

    // enrichAndSortPosts adds readingTime, shortExcerpt, formattedDate etc.
    // On SSR this runs server-side — the enriched data is baked into the HTML.
    // On CSR the same function runs in the browser, delaying first render.
    const posts       = enrichAndSortPosts(rawPosts);
    const derivedTags = extractTags(posts);
    const stats       = computePostStats(rawPosts);

    const serverMs = Date.now() - serverStart;

    return {
      props: {
        posts,
        stats,
        images: [
          "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Bitexco%20Quan%201.jpg",
          "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Dinh%20Doc%20Lap%20Quan%201.jpg",
          "https://ie213vqhbucket.sgp1.cdn.digitaloceanspaces.com/Seminar/Landmark%20Binh%20Thanh.jpg",
        ],
        tags:      ['SSR', 'Realtime', 'Per-request', 'TTFB', 'MongoDB', ...derivedTags],
        timeStamp: new Date().toLocaleString('vi-VN'),
        serverMs,   // ← passed to RenderBenchmark for honest display
      },
    };
  } catch (error) {
    console.error('SSR getServerSideProps error:', error.message);
    return {
      props: {
        posts: [], images: [], tags: [], stats: null,
        timeStamp: `Error: ${error.message}`,
        serverMs: Date.now() - serverStart,
      },
    };
  }
}