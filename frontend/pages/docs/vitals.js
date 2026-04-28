import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

const VITALS = [
  {
    name: 'LCP',
    full: 'Largest Contentful Paint',
    color: 'emerald',
    target: '< 2.5s',
    poor: '> 4.0s',
    unit: 's',
    icon: '🖼️',
    what: 'Thời gian để phần tử lớn nhất trên màn hình (thường là hero image hoặc heading chính) được render hoàn toàn. Đây là chỉ số người dùng cảm nhận trực tiếp nhất — "trang này load nhanh không?"',
    whyMatters: 'Google coi LCP là chỉ số quan trọng nhất trong Core Web Vitals. LCP kém đồng nghĩa với bounce rate cao — người dùng bỏ trang trước khi nhìn thấy nội dung.',
    byMode: [
      { mode: 'SSG', value: '~0.8s', rating: 'good',   note: 'HTML + image có ngay trong response đầu tiên' },
      { mode: 'ISR', value: '~0.9s', rating: 'good',   note: 'Tương tự SSG, HTML đã build sẵn' },
      { mode: 'SSR', value: '~1.8s', rating: 'fair',   note: 'Phải chờ server fetch + render trước khi gửi HTML' },
      { mode: 'CSR', value: '~4.5s', rating: 'poor',   note: 'JS load → React mount → fetch → render image' },
    ],
    tips: [
      'Dùng <Image> của Next.js với priority={true} cho hero image → trình duyệt biết preload sớm',
      'SSG/ISR: image URL đã có trong HTML → browser bắt đầu download ngay khi parse HTML',
      'Tránh lazy load image phần "above the fold" (phần nhìn thấy không cần scroll)',
      'Serve ảnh từ CDN cùng region (DigitalOcean Spaces SGP1 → HCM < 15ms)',
    ],
  },
  {
    name: 'FID',
    full: 'First Input Delay',
    color: 'blue',
    target: '< 100ms',
    poor: '> 300ms',
    unit: 'ms',
    icon: '👆',
    what: 'Thời gian từ khi user lần đầu tương tác (click, tap, keypress) đến khi browser thực sự bắt đầu xử lý event handler. FID đo lường khả năng phản hồi của trang khi đang trong quá trình load.',
    whyMatters: 'FID cao xảy ra khi main thread đang bận parse/execute JS bundle — click của user bị xếp hàng chờ. Cảm giác trang "đơ" hoặc "không phản hồi" khi vừa mở. Google đã thay FID bằng INP (Interaction to Next Paint) từ 2024 nhưng nguyên tắc giống nhau.',
    byMode: [
      { mode: 'SSG', value: '~8ms',   rating: 'good', note: 'Ít JS hơn, main thread rảnh sớm' },
      { mode: 'ISR', value: '~8ms',   rating: 'good', note: 'Tương tự SSG' },
      { mode: 'SSR', value: '~12ms',  rating: 'good', note: 'HTML từ server, hydration nhẹ' },
      { mode: 'CSR', value: '~180ms', rating: 'fair', note: 'Bundle lớn chiếm main thread trong khi parse' },
    ],
    tips: [
      'Code splitting: Next.js tự động split theo route — trang nào chỉ load JS của trang đó',
      'Tránh inline heavy computation trong useEffect ngay khi mount',
      'Lazy load component không cần thiết với dynamic import()',
      'CSR bundle lớn hơn vì inline toàn bộ component — main thread bị block lâu hơn',
    ],
  },
  {
    name: 'CLS',
    full: 'Cumulative Layout Shift',
    color: 'violet',
    target: '< 0.1',
    poor: '> 0.25',
    unit: '',
    icon: '📐',
    what: 'Tổng điểm dịch chuyển layout không mong muốn trong suốt vòng đời trang. Xảy ra khi element trên trang bị đẩy xung quanh sau khi đã render — ví dụ: ảnh load muộn đẩy text xuống, font swap làm text nhảy.',
    whyMatters: 'CLS cao là trải nghiệm tệ nhất cho người dùng — đang đọc bài thì text tự nhảy, click nhầm button vì nó dịch chuyển. Google phạt nặng trang có CLS > 0.25 trong ranking.',
    byMode: [
      { mode: 'SSG', value: '~0.02', rating: 'good', note: 'Dimensions đã biết từ HTML, không có layout shift' },
      { mode: 'ISR', value: '~0.02', rating: 'good', note: 'Tương tự SSG' },
      { mode: 'SSR', value: '~0.03', rating: 'good', note: 'HTML đầy đủ, ít skeleton swap' },
      { mode: 'CSR', value: '~0.18', rating: 'fair', note: 'Skeleton → content swap gây layout shift' },
    ],
    tips: [
      'Luôn set width và height cho <Image> — Next.js Image tự reserve không gian trước khi ảnh load',
      'CSR skeleton → real content swap gây CLS: dùng skeleton có đúng height với content thật',
      'Font: dùng font-display: swap cẩn thận, hoặc preload font chính để tránh FOUT',
      'Tránh inject content phía trên existing content sau khi render (ads, banners)',
    ],
  },
  {
    name: 'TTFB',
    full: 'Time to First Byte',
    color: 'rose',
    target: '< 800ms',
    poor: '> 1800ms',
    unit: 'ms',
    icon: '⚡',
    what: 'Thời gian từ khi browser gửi HTTP request đến khi nhận byte đầu tiên của response. TTFB bao gồm: DNS lookup + TCP connection + SSL handshake + server processing time. Với SSG/ISR: server processing gần như 0. Với SSR: bao gồm cả thời gian fetch database.',
    whyMatters: 'TTFB là "starting gun" của mọi metric khác — nếu TTFB cao, mọi thứ sau đó đều bị delay. Đây là điểm khác biệt rõ nhất giữa SSG và SSR trong dự án này.',
    byMode: [
      { mode: 'SSG', value: '~15ms',  rating: 'good', note: 'File tĩnh từ disk, không cần server compute' },
      { mode: 'ISR', value: '~20ms',  rating: 'good', note: 'Cached HTML, chỉ regenerate background' },
      { mode: 'SSR', value: '~350ms', rating: 'fair', note: 'Server fetch MongoDB + Mongoose + render' },
      { mode: 'CSR', value: '~15ms',  rating: 'good', note: 'HTML rỗng trả về ngay — nhưng FCP vẫn chậm' },
    ],
    tips: [
      'SSG/ISR TTFB thấp vì Coolify serve file tĩnh qua Traefik — không có Node.js processing',
      'SSR TTFB = thời gian Express query MongoDB + Mongoose hydration + Next.js render to string',
      'Đặt VPS cùng region với user (SGP1 cho VN) giảm TTFB ~150ms so với US region',
      'MongoDB trong cùng Docker network → query latency < 1ms, không ảnh hưởng nhiều đến SSR TTFB',
    ],
  },
  {
    name: 'TBT',
    full: 'Total Blocking Time',
    color: 'amber',
    target: '< 200ms',
    poor: '> 600ms',
    unit: 'ms',
    icon: '🧱',
    what: 'Tổng thời gian main thread bị block bởi các long tasks (task > 50ms). Mỗi long task, phần vượt quá 50ms được tính vào TBT. Đây là metric phản ánh trực tiếp kích thước và độ phức tạp của JS bundle.',
    whyMatters: 'TBT cao = trang cảm giác "đơ" khi đang load. Lighthouse dùng TBT thay cho FID trong lab testing vì FID cần user thực tế tương tác. TBT chiếm 25% điểm Lighthouse Performance.',
    byMode: [
      { mode: 'SSG', value: '~40ms',  rating: 'good', note: 'Ít JS, hydration nhẹ, main thread rảnh sớm' },
      { mode: 'ISR', value: '~40ms',  rating: 'good', note: 'Tương tự SSG' },
      { mode: 'SSR', value: '~55ms',  rating: 'good', note: 'Hydrate HTML đã có sẵn — ít work hơn' },
      { mode: 'CSR', value: '~380ms', rating: 'poor', note: 'Parse toàn bộ inlined bundle + React mount từ đầu' },
    ],
    tips: [
      'CSR bundle lớn hơn vì inline Navbar, Slider, Footer, BlogGrid trực tiếp vào file',
      'SSG/ISR/SSR import components riêng → Next.js code split thành chunks nhỏ load song song',
      'Tree shaking: chỉ import function cần dùng từ postUtils, không import toàn bộ',
      'Dùng Chrome DevTools Performance tab để xem long tasks màu đỏ trên main thread timeline',
    ],
  },
];

const RATING_CONFIG = {
  good: { label: 'Good',    bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-500' },
  fair: { label: 'Fair',    bg: 'bg-amber-500/20',   text: 'text-amber-300',   dot: 'bg-amber-500'   },
  poor: { label: 'Poor',    bg: 'bg-red-500/20',     text: 'text-red-300',     dot: 'bg-red-500'     },
};

const COLOR_MAP = {
  emerald: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  blue:    { border: 'border-blue-500',    text: 'text-blue-400',    bg: 'bg-blue-500/10',    badge: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-500',    bar: 'bg-blue-500'    },
  violet:  { border: 'border-violet-500',  text: 'text-violet-400',  bg: 'bg-violet-500/10',  badge: 'bg-violet-500/20 text-violet-300',  dot: 'bg-violet-500',  bar: 'bg-violet-500'  },
  rose:    { border: 'border-rose-500',    text: 'text-rose-400',    bg: 'bg-rose-500/10',    badge: 'bg-rose-500/20 text-rose-300',    dot: 'bg-rose-500',    bar: 'bg-rose-500'    },
  amber:   { border: 'border-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   badge: 'bg-amber-500/20 text-amber-300',  dot: 'bg-amber-500',   bar: 'bg-amber-500'   },
};

const MODE_COLOR = { SSG: 'text-emerald-400', ISR: 'text-blue-400', SSR: 'text-rose-400', CSR: 'text-amber-400' };

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="h-px flex-1 bg-slate-700" />
      <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500 font-mono">{children}</span>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

function VitalCard({ vital }) {
  const c = COLOR_MAP[vital.color];
  return (
    <div className={`rounded-2xl border ${c.border} border-opacity-30 bg-slate-800/50 overflow-hidden`}>

      {/* Header */}
      <div className={`border-b ${c.border} border-opacity-20 p-6`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${c.bg} border ${c.border} border-opacity-40 flex flex-col items-center justify-center flex-shrink-0`}>
              <span className="text-xl">{vital.icon}</span>
              <span className={`text-[10px] font-black font-mono ${c.text}`}>{vital.name}</span>
            </div>
            <div>
              <h3 className="text-white font-black text-xl leading-none mb-1">{vital.full}</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono ${c.badge} px-2 py-0.5 rounded`}>
                  Target: {vital.target}
                </span>
                <span className="text-[9px] font-mono text-slate-600">
                  Poor: {vital.poor}
                </span>
              </div>
            </div>
          </div>

          {/* Per-mode quick values */}
          <div className="flex gap-3 flex-wrap">
            {vital.byMode.map(m => {
              const r = RATING_CONFIG[m.rating];
              return (
                <div key={m.mode} className="bg-slate-900/60 rounded-lg px-3 py-2 text-center min-w-[60px]">
                  <p className={`text-[9px] font-black font-mono ${MODE_COLOR[m.mode]} uppercase`}>{m.mode}</p>
                  <p className="text-white font-black text-sm font-mono mt-0.5">{m.value}</p>
                  <span className={`text-[7px] font-black uppercase ${r.text}`}>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid md:grid-cols-3 gap-6">

        {/* What it measures */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">Đo lường gì?</p>
          <p className="text-sm text-slate-300 leading-relaxed">{vital.what}</p>
        </div>

        {/* Why it matters */}
        <div className={`${c.bg} rounded-xl p-4`}>
          <p className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono mb-2 ${c.text}`}>Tại sao quan trọng?</p>
          <p className="text-sm text-slate-300 leading-relaxed">{vital.whyMatters}</p>
        </div>

        {/* Tips */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">Tối ưu trong dự án</p>
          <ul className="space-y-2">
            {vital.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1 flex-shrink-0`} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Per-mode breakdown bar chart */}
      <div className="border-t border-slate-700/50 px-6 py-5">
        <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-600 mb-4">So sánh theo rendering mode</p>
        <div className="space-y-3">
          {vital.byMode.map(m => {
            const r = RATING_CONFIG[m.rating];
            // Visual bar width: good=30%, fair=65%, poor=95%
            const width = m.rating === 'good' ? '30%' : m.rating === 'fair' ? '65%' : '92%';
            return (
              <div key={m.mode} className="flex items-center gap-4">
                <span className={`text-[10px] font-black font-mono w-8 ${MODE_COLOR[m.mode]}`}>{m.mode}</span>
                <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${r.dot}`} style={{ width }} />
                </div>
                <span className={`text-[10px] font-mono font-bold w-16 text-right ${r.text}`}>{m.value}</span>
                <span className="text-[9px] text-slate-600 hidden md:block max-w-[240px] truncate">{m.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VitalsDoc() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
      <Head>
        <title>Core Web Vitals | Seminar Docs</title>
        <meta name="description" content="Phân tích LCP, FID, CLS, TTFB, TBT theo từng rendering mode trong dự án MENN Stack Seminar" />
      </Head>
      <Navbar />

      <main className="flex-grow">

        {/* ── Hero ── */}
        <div className="border-b border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-emerald-500 font-mono mb-4">
              Seminar Docs / Core Web Vitals
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter mb-6">
              CORE WEB<br />
              <span className="text-emerald-400">VITALS</span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-12">
              5 chỉ số Google dùng để đánh giá trải nghiệm người dùng thực tế — và là thước đo khách quan nhất để so sánh hiệu năng giữa SSG, SSR, ISR và CSR trong dự án này.
            </p>

            {/* Vitals overview grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {VITALS.map(v => {
                const c = COLOR_MAP[v.color];
                return (
                  <div key={v.name} className={`bg-slate-800/50 border ${c.border} border-opacity-30 rounded-xl p-4 text-center`}>
                    <span className="text-2xl block mb-1">{v.icon}</span>
                    <p className={`text-lg font-black ${c.text} font-mono`}>{v.name}</p>
                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">{v.target}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Lighthouse scoring explainer ── */}
        <div className="border-b border-slate-800 bg-slate-900/40">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <SectionLabel>Lighthouse Score — Cách tính điểm</SectionLabel>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-4">Trọng số từng metric</p>
                <div className="space-y-3">
                  {[
                    { name: 'LCP',  weight: 35, color: 'emerald' },
                    { name: 'TBT',  weight: 25, color: 'amber'   },
                    { name: 'FCP',  weight: 10, color: 'blue'    },
                    { name: 'Speed Index', weight: 10, color: 'violet' },
                    { name: 'CLS',  weight: 10, color: 'rose'    },
                    { name: 'TTI',  weight: 10, color: 'slate'   },
                  ].map(m => {
                    const barColor = COLOR_MAP[m.color]?.bar || 'bg-slate-500';
                    const textColor = COLOR_MAP[m.color]?.text || 'text-slate-400';
                    return (
                      <div key={m.name} className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-black w-24 ${textColor}`}>{m.name}</span>
                        <div className="flex-1 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${m.weight * 2.86}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{m.weight}%</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-600 mt-4 font-mono">Nguồn: Lighthouse v11 scoring weights</p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-4">Ước tính điểm theo rendering mode</p>
                <div className="space-y-4">
                  {[
                    { mode: 'SSG', score: 95, color: 'emerald' },
                    { mode: 'ISR', score: 92, color: 'blue'    },
                    { mode: 'SSR', score: 78, color: 'rose'    },
                    { mode: 'CSR', score: 45, color: 'amber'   },
                  ].map(m => {
                    const c = COLOR_MAP[m.color];
                    const scoreColor = m.score >= 90 ? 'text-emerald-400' : m.score >= 50 ? 'text-amber-400' : 'text-red-400';
                    return (
                      <div key={m.mode} className="flex items-center gap-4">
                        <span className={`text-[10px] font-black font-mono w-8 ${c.text}`}>{m.mode}</span>
                        <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${m.score}%` }} />
                        </div>
                        <span className={`text-sm font-black font-mono w-10 text-right ${scoreColor}`}>{m.score}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-600 mt-4 font-mono">* Ước tính dựa trên benchmark thực tế. Điểm thực tế đo bằng component RenderBenchmark trên mỗi trang.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Vital cards ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>Chi tiết từng chỉ số</SectionLabel>
          <div className="flex flex-col gap-8">
            {VITALS.map(v => <VitalCard key={v.name} vital={v} />)}
          </div>
        </div>

        {/* ── How to measure ── */}
        <div className="border-t border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>Cách đo trong dự án này</SectionLabel>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'RenderBenchmark Component',
                  color: 'emerald',
                  icon: '📊',
                  desc: 'Component tự build, đo real-time trực tiếp trên browser bằng PerformanceObserver API. Hiển thị FCP, LCP, TBT, TTFB, Hydration time ngay trên mỗi trang rendering.',
                  code: `const lcpObs = new PerformanceObserver(list => {
  const last = list.getEntries().at(-1);
  setMetrics(prev => ({
    ...prev, lcp: last.startTime
  }));
});
lcpObs.observe({
  type: 'largest-contentful-paint',
  buffered: true
});`,
                },
                {
                  title: 'Chrome DevTools',
                  color: 'blue',
                  icon: '🔬',
                  desc: 'Lighthouse tab trong Chrome DevTools chạy audit đầy đủ. Performance tab cho phép xem timeline chi tiết: long tasks (TBT), paint events (FCP/LCP), layout shifts (CLS).',
                  code: `// Mở Chrome DevTools
// Tab: Lighthouse
// Device: Mobile (khắt khe hơn)
// Categories: Performance
// → Generate Report

// Tab: Performance
// Record khi load trang
// Xem: Long Tasks (đỏ)
//       Paint events
//       Layout shifts`,
                },
                {
                  title: 'Navigation Timing API',
                  color: 'violet',
                  icon: '⏱️',
                  desc: 'Browser API built-in để đo TTFB và các timing khác. RenderBenchmark dùng API này để lấy responseStart - requestStart = TTFB thực tế của trang hiện tại.',
                  code: `const navEntry = performance
  .getEntriesByType('navigation')[0];

const ttfb =
  navEntry.responseStart -
  navEntry.requestStart;

// Long Tasks → TBT
const tbtObs = new PerformanceObserver(
  list => {
    list.getEntries().forEach(entry => {
      tbt += entry.duration - 50;
    });
  }
);
tbtObs.observe({ type: 'longtask' });`,
                },
              ].map(card => {
                const c = COLOR_MAP[card.color];
                return (
                  <div key={card.title} className={`bg-slate-800/50 border ${c.border} border-opacity-30 rounded-2xl overflow-hidden`}>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{card.icon}</span>
                        <p className={`text-[10px] font-black tracking-[0.15em] uppercase font-mono ${c.text}`}>{card.title}</p>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                    </div>
                    <div className="border-t border-slate-700/50 bg-slate-900/50">
                      <pre className="px-5 py-4 text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                        <code>{card.code}</code>
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      <MegaFooter tags={['LCP', 'FID', 'CLS', 'TTFB', 'TBT', 'Performance', 'Lighthouse', 'Web Vitals', 'PerformanceObserver', 'Core Web Vitals']} />
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}