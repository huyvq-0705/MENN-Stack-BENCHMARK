/**
 * RenderInfo.js — /frontend/components/RenderInfo.js
 *
 * Static educational panel. No Performance API, no measurements, no scores.
 * Shows what each rendering mode does, its flow, strengths, and weaknesses.
 *
 * Usage:
 *   import RenderInfo from '../../components/RenderInfo';
 *   <RenderInfo mode="SSR" serverMs={serverMs} />
 *
 * Props:
 *   mode     : "SSG" | "SSR" | "ISR" | "CSR"
 *   serverMs : (SSR only) actual ms from getServerSideProps
 *   buildTime: (SSG/ISR) timestamp string from getStaticProps
 */

import { useState } from 'react';
import Link from 'next/link';

const MODE_DATA = {
  SSG: {
    label:    'Static Site Generation',
    short:    'SSG',
    color:    'emerald',
    border:   'border-emerald-500',
    bg:       'bg-emerald-500',
    lightBg:  'bg-emerald-50',
    darkText: 'text-emerald-700',
    tag:      'bg-emerald-100 text-emerald-700 border-emerald-200',

    tagline: 'HTML được build sẵn — phục vụ từ CDN với tốc độ tối đa.',

    flow: [
      { label: 'next build', desc: 'Next.js chạy getStaticProps, fetch DB, render HTML' },
      { label: 'Output', desc: 'File .html tĩnh được lưu vào thư mục .next' },
      { label: 'Deploy', desc: 'File tĩnh được đẩy lên CDN (Vercel, Cloudflare, S3…)' },
      { label: 'User request', desc: 'CDN trả file ngay lập tức — không chạy bất kỳ code nào' },
      { label: 'Browser', desc: 'Nhận HTML đầy đủ, vẽ trang, tải JS để hydrate' },
    ],

    strengths: [
      'TTFB cực thấp — CDN trả file trong vài ms, không có server compute',
      'FCP và LCP tốt nhất — HTML đầy đủ từ byte đầu tiên, browser vẽ ngay',
      'Không tốn server resource mỗi request — chi phí infrastructure thấp',
      'Dễ cache 100% trên CDN — toàn bộ trang là file tĩnh',
      'SEO hoàn hảo — Googlebot đọc được HTML ngay không cần JS',
      'Uptime cao — không phụ thuộc vào server/DB ở runtime',
    ],

    weaknesses: [
      'Dữ liệu đóng băng tại thời điểm build — bài viết mới không xuất hiện cho đến khi rebuild',
      'Phải chạy lại next build và redeploy để cập nhật nội dung',
      'Build time tăng theo số trang — site lớn có thể mất nhiều phút để build',
      'Không phù hợp với nội dung cá nhân hoá (dashboard, giỏ hàng, trang user)',
    ],

    bestFor: 'Blog, landing page, tài liệu, marketing site — bất kỳ nội dung nào không thay đổi theo từng user hay từng request.',

    vitals: {
      TTFB:  { expect: '~10–50ms',    rating: 'good',    note: 'CDN phản hồi ngay, không có server processing' },
      FCP:   { expect: '~200–600ms',  rating: 'good',    note: 'HTML đầy đủ → browser vẽ ngay khi nhận bytes đầu' },
      LCP:   { expect: '~400–900ms',  rating: 'good',    note: 'Ảnh hero trong HTML → fetch song song với parse' },
      TBT:   { expect: '~100–350ms',  rating: 'fair',    note: 'JS hydration chạy sau khi trang đã hiển thị' },
    },
  },

  SSR: {
    label:    'Server-Side Rendering',
    short:    'SSR',
    color:    'rose',
    border:   'border-rose-500',
    bg:       'bg-rose-500',
    lightBg:  'bg-rose-50',
    darkText: 'text-rose-700',
    tag:      'bg-rose-100 text-rose-700 border-rose-200',

    tagline: 'Server tạo HTML mới cho mỗi request — dữ liệu luôn mới nhất, TTFB cao hơn.',

    flow: [
      { label: 'User request', desc: 'Browser gửi HTTP request đến Next.js server' },
      { label: 'getServerSideProps', desc: 'Server fetch MongoDB, enrich posts, chuẩn bị data' },
      { label: 'React render', desc: 'Next.js render component tree thành HTML string trên server' },
      { label: 'Send HTML', desc: 'Server gửi HTML hoàn chỉnh — user thấy blank screen cho đến bước này' },
      { label: 'Browser paint', desc: 'Browser nhận HTML, vẽ trang, tải JS để hydrate' },
      { label: 'Hydration', desc: 'React attach event listeners vào DOM có sẵn' },
    ],

    strengths: [
      'Dữ liệu luôn mới nhất — mỗi request lấy trực tiếp từ DB',
      'SEO hoàn hảo — HTML đầy đủ gửi về trước khi JS chạy',
      'FCP và LCP tốt hơn CSR — browser vẽ từ HTML server-rendered, không chờ JS fetch data',
      'Phù hợp với nội dung cá nhân hoá theo user (session, auth)',
      'Không cần rebuild khi DB thay đổi — request tiếp theo tự lấy data mới',
    ],

    weaknesses: [
      'TTFB cao hơn SSG/ISR — user chờ server xử lý trước khi nhận byte đầu tiên',
      'Mỗi request tốn server resource — chi phí infrastructure cao hơn SSG',
      'Khó cache — response khác nhau theo thời gian/user nên CDN cache ít hiệu quả',
      'Server trở thành bottleneck khi traffic cao — cần scale server thay vì chỉ scale CDN',
      'DB down = trang down — không có fallback tĩnh như SSG/ISR',
    ],

    bestFor: 'Trang cần data realtime mỗi request: dashboard cá nhân, trang admin, nội dung phụ thuộc vào session người dùng.',

    vitals: {
      TTFB:  { expect: '~300–1500ms', rating: 'poor',   note: 'DNS + TCP + server fetch DB + render HTML — tất cả trước byte đầu tiên' },
      FCP:   { expect: '~500–1500ms', rating: 'fair',   note: 'FCP = TTFB + browser parse time — bị kéo lên bởi TTFB' },
      LCP:   { expect: '~700–1800ms', rating: 'fair',   note: 'Ảnh trong HTML → fetch song song, nhưng bị delay bởi TTFB' },
      TBT:   { expect: '~100–350ms',  rating: 'fair',   note: 'JS hydration tương tự SSG — không block initial paint' },
    },
  },

  ISR: {
    label:    'Incremental Static Regeneration',
    short:    'ISR',
    color:    'blue',
    border:   'border-blue-500',
    bg:       'bg-blue-500',
    lightBg:  'bg-blue-50',
    darkText: 'text-blue-700',
    tag:      'bg-blue-100 text-blue-700 border-blue-200',

    tagline: 'Tốc độ của SSG + khả năng cập nhật của SSR — không cần rebuild toàn bộ site.',

    flow: [
      { label: 'next build', desc: 'Build lần đầu giống SSG — tạo HTML tĩnh, cache lên CDN' },
      { label: 'User request (cache HIT)', desc: 'CDN trả HTML cached ngay lập tức — nhanh như SSG' },
      { label: 'Webhook trigger', desc: 'Backend gọi /api/revalidate sau khi tạo/sửa bài viết' },
      { label: 'Background regen', desc: 'Next.js fetch DB và render lại trang ở background — không block user nào' },
      { label: 'Cache update', desc: 'HTML mới thay thế cache cũ — request tiếp theo nhận bản mới' },
    ],

    strengths: [
      'TTFB và FCP ngang SSG — cache hit phục vụ từ CDN ngay lập tức',
      'Dữ liệu cập nhật on-demand qua webhook — không bao giờ stale quá lâu',
      'Không cần rebuild toàn bộ site — chỉ regenerate đúng trang cần thiết',
      'Regeneration ở background — không có user nào phải chờ lúc rebuild',
      'SEO hoàn hảo như SSG — HTML đầy đủ từ CDN',
      'Chi phí server thấp — chỉ tốn compute khi webhook trigger, không phải mỗi request',
    ],

    weaknesses: [
      'Phức tạp hơn SSG — cần setup webhook endpoint và logic revalidate',
      'Cửa sổ stale ngắn: user đầu tiên sau webhook nhận bản cũ, user thứ hai mới có bản mới',
      'Cần backend hỗ trợ gọi webhook khi data thay đổi — thêm điểm có thể fail',
      'Nếu webhook không gửi được, trang sẽ không bao giờ cập nhật tự động',
    ],

    bestFor: 'Blog, e-commerce, news site — nội dung thay đổi không liên tục và không cần realtime tuyệt đối mỗi request.',

    vitals: {
      TTFB:  { expect: '~10–50ms',    rating: 'good',    note: 'Cache hit = CDN response ngay — giống hệt SSG' },
      FCP:   { expect: '~200–600ms',  rating: 'good',    note: 'HTML cached đầy đủ → browser vẽ ngay như SSG' },
      LCP:   { expect: '~400–900ms',  rating: 'good',    note: 'Ảnh trong cached HTML → fetch song song' },
      TBT:   { expect: '~100–350ms',  rating: 'fair',    note: 'JS hydration như SSG/SSR — không block paint' },
    },
  },

  CSR: {
    label:    'Client-Side Rendering',
    short:    'CSR',
    color:    'amber',
    border:   'border-amber-500',
    bg:       'bg-amber-500',
    lightBg:  'bg-amber-50',
    darkText: 'text-amber-700',
    tag:      'bg-amber-100 text-amber-700 border-amber-200',

    tagline: 'Server chỉ trả HTML rỗng — mọi thứ xảy ra trong browser, sau khi JS load xong.',

    flow: [
      { label: 'User request', desc: 'Browser nhận HTML rỗng (<div id="__next"></div>) từ Next.js' },
      { label: 'Tải JS bundle', desc: 'Browser download toàn bộ JS bundle (component tree + postUtils + React)' },
      { label: 'Parse & execute JS', desc: 'Browser parse và chạy JS — main thread bị block trong bước này' },
      { label: 'React mount', desc: 'React khởi tạo component, gọi useEffect' },
      { label: 'Fetch data', desc: 'Browser gọi /api/blog-proxy → Next.js → Express → MongoDB' },
      { label: 'Preload images', desc: 'Đợi ảnh hero load xong trước khi render (trong implementation này)' },
      { label: 'Render UI', desc: 'React render toàn bộ trang — user mới thấy nội dung lần đầu' },
    ],

    strengths: [
      'TTFB cực thấp — server chỉ trả file HTML rỗng, không có processing',
      'Giảm tải server hoàn toàn — mọi compute xảy ra trên client',
      'Backend URL ẩn — request đi qua Next.js proxy, client không biết Express server ở đâu',
      'Trải nghiệm app-like sau khi load — navigation tiếp theo rất nhanh (SPA behavior)',
      'Dễ implement auth và protected routes — không có gì được render trên server',
    ],

    weaknesses: [
      'FCP và LCP tệ nhất — user thấy màn hình trắng/spinner cho đến khi JS + fetch hoàn tất',
      'SEO kém — Googlebot thấy HTML rỗng, không crawl được nội dung',
      'Phụ thuộc JS — tắt JS hoặc JS lỗi = trang trắng hoàn toàn',
      'Ảnh hero chỉ được fetch SAU KHI JS render — LCP bị delay nghiêm trọng',
      'Bundle lớn block main thread — TBT cao hơn SSG/SSR/ISR',
      'Không thể dùng HTTP cache cho nội dung động — mỗi lần vào là fetch lại',
    ],

    bestFor: 'Admin dashboard, trang sau login, công cụ nội bộ — bất kỳ nơi nào SEO không quan trọng và cần bảo mật backend.',

    vitals: {
      TTFB:  { expect: '~5–20ms',      rating: 'good',  note: 'HTML rỗng — server không làm gì cả. Nhưng đây là con số gây hiểu nhầm' },
      FCP:   { expect: '~1500–4000ms', rating: 'poor',  note: 'Chờ JS tải + chạy + fetch + render — user thấy trắng trong suốt thời gian này' },
      LCP:   { expect: '~2000–5000ms', rating: 'poor',  note: 'Ảnh hero không tồn tại trong HTML ban đầu — chỉ xuất hiện sau khi JS render' },
      TBT:   { expect: '~300–800ms',   rating: 'poor',  note: 'JS bundle lớn chạy trên main thread trước khi bất cứ thứ gì hiển thị' },
    },
  },
};

const RATING_STYLE = {
  good: 'text-emerald-600 bg-emerald-100',
  fair: 'text-amber-600 bg-amber-100',
  poor: 'text-red-600 bg-red-100',
};

const NAV_LINKS = [
  { name: 'SSG', path: '/ssg/homepage' },
  { name: 'SSR', path: '/ssr/homepage' },
  { name: 'ISR', path: '/isr/homepage' },
  { name: 'CSR', path: '/csr/homepage' },
];

export default function RenderInfo({ mode = 'CSR', serverMs = null, buildTime = null }) {
  const [open, setOpen] = useState(false);

  const d = MODE_DATA[mode];

  return (
    <div className={`border-t-4 ${d.border} bg-white`}>

      {/* ── Collapsed bar — always visible, click to toggle ── */}
      <div
        className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className={`${d.bg} text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded`}>
            {d.short}
          </span>
          <span className="text-[10px] font-black tracking-[0.1em] uppercase text-slate-500">{d.label}</span>
          <span className="text-[9px] text-slate-400 hidden md:block">— {d.tagline}</span>
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </div>

      {/* ── Expanded content ── */}
      {open && (
      <div className="max-w-6xl mx-auto px-6 pb-8 border-t border-slate-100 pt-6">

        {/* Mode switcher */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 w-fit mb-6">
          {NAV_LINKS.map(link => (
            <Link key={link.name} href={link.path}>
              <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded cursor-pointer transition-colors block ${
                mode === link.name
                  ? `${d.bg} text-white`
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}>
                {link.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left col: Flow + Vitals ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Request flow */}
            <div>
              <h3 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono mb-3">
                Request Flow
              </h3>
              <div className="space-y-2">
                {d.flow.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full ${d.bg} text-white flex items-center justify-center text-[9px] font-black`}>
                        {i + 1}
                      </div>
                      {i < d.flow.length - 1 && (
                        <div className="w-px h-4 bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest font-mono px-2 py-0.5 rounded border ${d.tag}`}>
                        {step.label}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Web Vitals */}
            <div>
              <h3 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono mb-3">
                Expected Web Vitals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(d.vitals).map(([key, v]) => (
                  <div key={key} className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 font-mono">{key}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${RATING_STYLE[v.rating]}`}>
                          {v.rating === 'good' ? 'Good' : v.rating === 'fair' ? 'Fair' : 'Poor'}
                        </span>
                        <span className="text-[10px] font-black text-slate-700 tabular-nums">{v.expect}</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed">{v.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Server cost callout — SSR only */}
            {serverMs != null && (
              <div className="bg-slate-800 text-white rounded-xl p-4">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Actual Server Cost This Request
                </p>
                <p className="text-2xl font-black tabular-nums mb-1">
                  {serverMs}<span className="text-sm text-slate-400 font-mono ml-1">ms</span>
                </p>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  Thời gian getServerSideProps chạy: fetch MongoDB → enrich posts → render HTML.
                  Con số này cộng trực tiếp vào TTFB của user. SSG/ISR: 0ms mỗi request.
                </p>
                <div className="mt-3 h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${serverMs < 500 ? 'bg-emerald-400' : serverMs < 1500 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min((serverMs / 3000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Build time callout — SSG/ISR */}
            {buildTime != null && (
              <div className={`${d.lightBg} border ${d.border} border-opacity-30 rounded-xl p-4`}>
                <p className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${d.darkText} font-bold`}>
                  {mode === 'ISR' ? 'Last Regenerated' : 'Built At'}
                </p>
                <p className="text-sm font-black text-slate-800">{buildTime}</p>
                <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                  {mode === 'ISR'
                    ? 'Trang này sẽ được regenerate tự động khi backend gọi /api/revalidate. Server cost mỗi request: 0ms.'
                    : 'Trang này sẽ không thay đổi cho đến khi chạy lại next build. Mọi bài viết mới sau thời điểm này sẽ không xuất hiện.'}
                </p>
              </div>
            )}
          </div>

          {/* ── Right col: Strengths, Weaknesses, Best for ── */}
          <div className="space-y-5">

            <div>
              <h3 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono mb-3">
                Strengths
              </h3>
              <ul className="space-y-2">
                {d.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                    <span className="text-emerald-500 font-black flex-shrink-0 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 font-mono mb-3">
                Weaknesses
              </h3>
              <ul className="space-y-2">
                {d.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                    <span className="text-red-400 font-black flex-shrink-0 mt-0.5">✕</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${d.lightBg} border ${d.border} border-opacity-20 rounded-xl p-4`}>
              <h3 className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono mb-2 ${d.darkText}`}>
                Best For
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{d.bestFor}</p>
            </div>

          </div>
        </div>
      </div>
      )}
    </div>
  );
}