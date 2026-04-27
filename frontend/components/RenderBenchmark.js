/**
 * RenderBenchmark Component
 *
 * Đo lường các chỉ số Web Vitals thực tế bằng Browser Performance API.
 * Không có số giả — tất cả đều được đo trực tiếp từ trình duyệt.
 *
 * Metrics được đo:
 * - TTFB  : Time to First Byte (chỉ có trên SSR/ISR/SSG — response từ server)
 * - FCP   : First Contentful Paint (PerformanceObserver)
 * - LCP   : Largest Contentful Paint (PerformanceObserver)
 * - TBT   : Total Blocking Time (ước tính từ Long Tasks API)
 * - Hydration Time : Thời gian từ khi JS bắt đầu chạy đến khi component mount xong
 *
 * Usage:
 *   <RenderBenchmark mode="ISR" color="rose" startTime={pageLoadStart} />
 *
 * Props:
 *   mode       : "SSG" | "SSR" | "ISR" | "CSR"
 *   color      : Tailwind color name used in your page (emerald, rose, blue, amber)
 *   startTime  : performance.now() captured as early as possible (top of page file)
 *   serverMs   : (optional) server render time passed via getServerSideProps/getStaticProps
 */

import { useState, useEffect, useRef } from 'react';

// Màu sắc theo từng rendering mode
const MODE_COLORS = {
  SSG: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', light: 'bg-emerald-50', dark: 'text-emerald-600' },
  SSR: { bg: 'bg-rose-500',    text: 'text-rose-400',    border: 'border-rose-500',    light: 'bg-rose-50',    dark: 'text-rose-600'    },
  ISR: { bg: 'bg-blue-500',    text: 'text-blue-400',    border: 'border-blue-500',    light: 'bg-blue-50',    dark: 'text-blue-600'    },
  CSR: { bg: 'bg-amber-500',   text: 'text-amber-400',   border: 'border-amber-500',   light: 'bg-amber-50',   dark: 'text-amber-600'   },
};

// Ngưỡng đánh giá theo chuẩn Google Lighthouse
const THRESHOLDS = {
  FCP:  { good: 1800,  poor: 3000  },
  LCP:  { good: 2500,  poor: 4000  },
  TBT:  { good: 200,   poor: 600   },
  TTFB: { good: 800,   poor: 1800  },
  HYD:  { good: 300,   poor: 1000  },
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
  'good':               { label: 'Good',   color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  'needs-improvement':  { label: 'Fair',   color: 'text-amber-600',   bg: 'bg-amber-100',   dot: 'bg-amber-500'   },
  'poor':               { label: 'Poor',   color: 'text-red-600',     bg: 'bg-red-100',     dot: 'bg-red-500'     },
};

function MetricCard({ label, value, unit = 'ms', metric, description }) {
  const rating = getRating(metric, value);
  const rs = rating ? RATING_STYLES[rating] : null;
  const displayValue = value !== null && value !== undefined ? Math.round(value) : '—';

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col gap-2">
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

      {/* Progress bar */}
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
    </div>
  );
}

export default function RenderBenchmark({ mode = 'CSR', startTime, serverMs }) {
  const colors = MODE_COLORS[mode] || MODE_COLORS.CSR;
  const mountTime = useRef(performance.now());

  const [metrics, setMetrics] = useState({
    fcp:  null,
    lcp:  null,
    tbt:  null,
    ttfb: null,
    hyd:  null,
  });
  const [collecting, setCollecting] = useState(true);
  const [expanded, setExpanded]     = useState(false);

  useEffect(() => {
    const hydrationTime = performance.now() - (startTime || mountTime.current);
    const collected = { hyd: hydrationTime };

    // ── TTFB từ Navigation Timing API ────────────────────────────────────────
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      collected.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    // ── FCP & LCP từ PerformanceObserver ─────────────────────────────────────
    let fcpDone = false;
    let lcpDone = false;

    const checkDone = () => {
      if (fcpDone && lcpDone) setCollecting(false);
    };

    // FCP
    try {
      const fcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
          fcpDone = true;
          checkDone();
          fcpObs.disconnect();
        }
      });
      fcpObs.observe({ type: 'paint', buffered: true });
    } catch {
      fcpDone = true;
    }

    // LCP
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) setMetrics(prev => ({ ...prev, lcp: last.startTime }));
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });

      // LCP finalises on user interaction or after 5s
      const finaliseLcp = () => {
        lcpDone = true;
        checkDone();
        lcpObs.disconnect();
      };
      setTimeout(finaliseLcp, 5000);
      ['click','keydown','scroll'].forEach(e =>
        window.addEventListener(e, finaliseLcp, { once: true })
      );
    } catch {
      lcpDone = true;
    }

    // ── TBT từ Long Tasks API ─────────────────────────────────────────────────
    let tbt = 0;
    try {
      const tbtObs = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          // Long task = bất kỳ task nào > 50ms. TBT = phần vượt quá 50ms
          tbt += entry.duration - 50;
        });
        setMetrics(prev => ({ ...prev, tbt: Math.max(tbt, 0) }));
      });
      tbtObs.observe({ type: 'longtask', buffered: true });
      setTimeout(() => tbtObs.disconnect(), 8000);
    } catch {
      // Long Tasks API không khả dụng trên mọi browser
    }

    // Ghi tất cả metrics ban đầu
    setMetrics(prev => ({ ...prev, ...collected }));

    // Fallback: đánh dấu done sau 6 giây nếu observer không trigger
    const timeout = setTimeout(() => setCollecting(false), 6000);
    return () => clearTimeout(timeout);
  }, [startTime]);

  // Tính Lighthouse-style overall score (đơn giản hóa)
  const scoreMetrics = [
    { v: metrics.fcp,  w: 0.25, t: THRESHOLDS.FCP  },
    { v: metrics.lcp,  w: 0.35, t: THRESHOLDS.LCP  },
    { v: metrics.tbt,  w: 0.25, t: THRESHOLDS.TBT  },
    { v: metrics.ttfb, w: 0.15, t: THRESHOLDS.TTFB },
  ];
  const available = scoreMetrics.filter(m => m.v !== null);
  const score = available.length > 0
    ? Math.round(
        available.reduce((acc, m) => {
          const ratio = Math.min(m.v / m.t.poor, 1);
          return acc + (1 - ratio) * (m.w / available.reduce((s, x) => s + x.w, 0));
        }, 0) * 100
      )
    : null;

  const scoreColor = score === null ? 'text-slate-400' :
    score >= 90 ? 'text-emerald-500' :
    score >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className={`border-t-4 ${colors.border} bg-slate-50`}>
      {/* ── Header row ── */}
      <div
        className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`${colors.bg} text-slate-900 text-[9px] font-black tracking-[0.2em] uppercase px-2 py-1 rounded`}>
            {mode}
          </div>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-500">
            Performance Benchmark
          </span>
          {collecting && (
            <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Measuring...
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Score badge */}
          {score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Score</span>
              <span className={`text-xl font-black tabular-nums ${scoreColor}`}>{score}</span>
              <span className="text-[9px] text-slate-300">/100</span>
            </div>
          )}

          {/* Quick metrics pill */}
          <div className="hidden md:flex items-center gap-3 text-[9px] font-mono text-slate-500">
            {metrics.fcp  !== null && <span>FCP <b className="text-slate-700">{Math.round(metrics.fcp)}ms</b></span>}
            {metrics.lcp  !== null && <span>LCP <b className="text-slate-700">{Math.round(metrics.lcp)}ms</b></span>}
            {metrics.tbt  !== null && <span>TBT <b className="text-slate-700">{Math.round(metrics.tbt)}ms</b></span>}
          </div>

          <span className="text-slate-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="max-w-6xl mx-auto px-6 pb-8">

          {/* Explanation banner */}
          <div className={`${colors.light} border ${colors.border} border-opacity-30 rounded-xl p-4 mb-6 text-xs`}>
            <p className={`font-black uppercase tracking-[0.15em] text-[9px] ${colors.dark} mb-1`}>
              Về {mode} Rendering
            </p>
            <p className="text-slate-600 leading-relaxed">
              {mode === 'SSG' && 'HTML được tạo sẵn tại build time. Không có server processing khi user request → TTFB thấp nhất, FCP nhanh nhất. Dữ liệu có thể cũ.'}
              {mode === 'SSR' && 'HTML được tạo mới trên server mỗi request. TTFB cao hơn SSG vì phải chờ server xử lý, nhưng dữ liệu luôn mới nhất.'}
              {mode === 'ISR' && 'Kết hợp: Lần đầu serve static HTML (nhanh như SSG), background revalidate sau interval. Cân bằng tốt nhất giữa tốc độ và data freshness.'}
              {mode === 'CSR' && 'HTML rỗng từ server, toàn bộ render xảy ra ở browser sau khi JS load xong. FCP và LCP cao nhất vì phải chờ JS → fetch → render.'}
            </p>
          </div>

          {/* Metric cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <MetricCard
              label="FCP"
              metric="FCP"
              value={metrics.fcp}
              description="First Contentful Paint — thời gian đến khi browser vẽ nội dung đầu tiên."
            />
            <MetricCard
              label="LCP"
              metric="LCP"
              value={metrics.lcp}
              description="Largest Contentful Paint — thời gian đến khi phần tử lớn nhất hiển thị."
            />
            <MetricCard
              label="TBT"
              metric="TBT"
              value={metrics.tbt}
              description="Total Blocking Time — tổng thời gian main thread bị block bởi JS."
            />
            <MetricCard
              label="TTFB"
              metric="TTFB"
              value={metrics.ttfb}
              description="Time to First Byte — thời gian server phản hồi byte đầu tiên."
            />
            <MetricCard
              label="Hydration"
              metric="HYD"
              value={metrics.hyd}
              description="Thời gian React mount component từ khi JS bắt đầu chạy."
            />
          </div>

          {/* Server render time nếu được truyền vào */}
          {serverMs !== undefined && serverMs !== null && (
            <div className="bg-slate-800 text-white rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1">Server Render Time</p>
                <p className="text-lg font-black">{serverMs} <span className="text-xs text-slate-400 font-mono">ms</span></p>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs text-right leading-relaxed">
                Thời gian server tạo HTML trước khi gửi về browser.
                {mode === 'CSR' && ' N/A — CSR không có server render.'}
              </p>
            </div>
          )}

          {/* Lighthouse score bar */}
          {score !== null && (
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono">
                  Estimated Lighthouse Score
                </span>
                <span className={`text-lg font-black ${scoreColor}`}>{score}/100</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score >= 90 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-2">
                * Ước tính dựa trên FCP, LCP, TBT, TTFB được đo thực tế. Không phải điểm Lighthouse chính thức.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}