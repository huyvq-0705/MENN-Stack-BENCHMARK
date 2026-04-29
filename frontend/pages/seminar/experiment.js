import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

const RESULTS = [
  {
    mode: 'SSG', color: 'emerald', score: 92, label: 'Xuất sắc',
    ttfb: '~10ms', fcp: '~0.4s', lcp: '~0.7s', si: '~0.6s',
    scoreReason: 'Trang đã được đóng gói thành file HTML tĩnh ngay tại npm run build. Máy chủ Next.js hoàn toàn không phải thực thi lệnh gọi API nào tới Backend khi người dùng truy cập — CDN phục vụ file tức thì.',
    filmstrip: ['blank', 'content', 'content', 'image', 'done'],
    filmDesc: 'Sau khi gửi yêu cầu, trình duyệt đã nhận trang được build sẵn. Song song đó, hình ảnh là nội dung nặng nhất nên cần thêm thời gian để hiển thị.',
    conclusion: 'Trang SSG cung cấp trải nghiệm tốc độ hoàn hảo nhất. Tuy nhiên, dữ liệu trên trang bị cố định — bài viết mới sau thời điểm Build không xuất hiện.',
    tradeoff: 'Dữ liệu đóng băng tại build time.',
    data: 'Đóng băng tại build',
  },
  {
    mode: 'ISR', color: 'blue', score: 92, label: 'Xuất sắc',
    ttfb: '~10ms', fcp: '~0.4s', lcp: '~0.7s', si: '~0.6s',
    scoreReason: 'Tương tự SSG, ISR có các trang web đã được xây dựng sẵn thành file HTML hoàn chỉnh và máy chủ Next.js chỉ cần đưa nội dung qua cho người dùng. Nội dung luôn được cập nhật mới nhờ cơ chế on-demand revalidation qua webhook.',
    filmstrip: ['blank', 'content', 'content', 'image', 'done'],
    filmDesc: 'Sau khi gửi yêu cầu, trình duyệt đã nhận trang được build sẵn từ cache và chỉ cần chờ hình ảnh load vào trình duyệt.',
    conclusion: 'ISR là minh chứng rõ ràng nhất cho sự ưu việt của kiến trúc Hybrid. Phục vụ nội dung tĩnh ngay lập tức và chỉ âm thầm kết nối Backend để làm mới dữ liệu ở background.',
    tradeoff: 'Cần setup webhook endpoint, phức tạp hơn SSG.',
    data: 'On-demand qua webhook',
  },
  {
    mode: 'SSR', color: 'rose', score: 88, label: 'Tốt',
    ttfb: '~300ms', fcp: '~0.8s', lcp: '~1.1s', si: '~1.8s',
    scoreReason: 'Mỗi khi người dùng truy cập, máy chủ Next.js phải gọi API lấy dữ liệu từ Backend và tiến hành render HTML ngay tại thời điểm đó. Quá trình chờ dữ liệu này tạo ra độ trễ, làm chỉ số Speed Index bị kéo dài lên 1.8 giây.',
    filmstrip: ['blank', 'blank', 'content', 'content', 'done'],
    filmDesc: 'Sau khi gửi yêu cầu, trình duyệt phải đứng chờ máy chủ xử lý xong dữ liệu mới nhận được trang web. User thấy trắng trong thời gian server render.',
    conclusion: 'SSR đảm bảo nội dung luôn mới nhất và chính xác ở thời gian thực. Tuy nhiên, tốc độ không còn tức thì và phụ thuộc hoàn toàn vào sức khỏe của máy chủ.',
    tradeoff: 'Tốc độ phụ thuộc vào server — traffic cao dẫn đến TTFB cao.',
    data: 'Realtime mỗi request',
  },
  {
    mode: 'CSR', color: 'amber', score: 88, label: 'Tốt',
    ttfb: '~5ms', fcp: '~1.2s', lcp: '~2.1s', si: '~2.0s',
    scoreReason: 'Tương tự SSR, CSR cần thời gian xây dựng và lấy dữ liệu từ Server trước khi hiển thị nội dung hoàn chỉnh. Khác với SSR, CSR xây dựng dữ liệu hoàn toàn trên trình duyệt người dùng, giảm chi phí Server nhưng user phải nhìn màn hình loading.',
    filmstrip: ['blank', 'blank', 'spinner', 'spinner', 'done'],
    filmDesc: 'Sau khi gửi yêu cầu, trình duyệt lập tức nhận phản hồi HTML rỗng nhưng vẫn chờ thời gian trình duyệt lấy dữ liệu từ server để hiển thị được.',
    conclusion: 'Dù trang phản hồi khung giao diện nhanh (TTFB thấp), người dùng vẫn phải nhìn màn hình chờ một khoảng thời gian lâu trước khi thấy nội dung thực sự.',
    tradeoff: 'TTFB thấp nhưng gây hiểu nhầm — HTML rỗng, nội dung chưa có gì.',
    data: 'Realtime, fetch tại browser',
  },
];

const REAL_WORLD = [
  {
    page: 'Trang chủ & Bài viết',
    path: '/ và /posts/[slug]',
    mode: 'ISR', color: 'blue',
    reason: 'Nếu dùng SSG, nội dung trang chủ sẽ bị cố định. ISR giúp trang chủ vừa có tốc độ phản hồi nhanh, vừa đảm bảo SEO vượt trội và tự động cập nhật khi có bài viết mới.',
    how: 'Khi admin thêm hoặc sửa bài viết, backend gửi webhook → Next.js regenerate trang ở background → user tiếp theo nhận bản mới mà không cần rebuild.',
    icon: '🏠',
  },
  {
    page: 'Trang thông tin tĩnh',
    path: '/docs/hybrid, /docs/seo, ...',
    mode: 'SSG', color: 'emerald',
    reason: 'Các trang nội dung Footer như "Về chúng tôi" hay "Điều khoản" gần như không bao giờ thay đổi. SSG là phương án hiệu quả nhất — loại bỏ hoàn toàn việc gọi Backend hay truy vấn DB mỗi khi có người xem.',
    how: 'Toàn bộ nội dung được biên dịch thành file HTML tĩnh một lần khi Build. Khi user nhấn link ở Footer, trình duyệt tải ngay file đã có sẵn trên CDN.',
    icon: '📄',
  },
  {
    page: 'Trang Tìm kiếm',
    path: '/search?q=...',
    mode: 'SSR', color: 'rose',
    reason: 'Kết quả tìm kiếm phụ thuộc hoàn toàn vào từ khóa người dùng nhập tại thời điểm thực tế. Không thể dùng SSG hay ISR vì không thể xác định trước các tổ hợp tìm kiếm.',
    how: 'Mỗi khi user tìm kiếm, yêu cầu gửi đến server. Next.js truy vấn DB, lấy danh sách bài viết khớp từ khóa và render thành HTML hoàn chỉnh trước khi gửi về trình duyệt.',
    icon: '🔍',
  },
  {
    page: 'Trang Quản trị',
    path: '/admin/dashboard',
    mode: 'CSR', color: 'amber',
    reason: 'Trang admin chứa thông tin riêng tư và yêu cầu tính tương tác cao (thêm, xóa, sửa bài viết). Tối ưu SEO là không cần thiết — CSR tạo ra giao diện mượt mà như Desktop App.',
    how: 'Browser tải bộ khung ứng dụng trống. JS gọi API lấy dữ liệu bài viết. Mọi thay đổi cập nhật trực tiếp trên giao diện ngay khi có phản hồi từ Backend mà không tải lại trang.',
    icon: '⚙️',
  },
];

const COLOR = {
  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200' },
  blue:    { bg: 'bg-blue-500',    light: 'bg-blue-50',    border: 'border-blue-500',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700',    ring: 'ring-blue-200'    },
  rose:    { bg: 'bg-rose-500',    light: 'bg-rose-50',    border: 'border-rose-500',    text: 'text-rose-700',    badge: 'bg-rose-100 text-rose-700',    ring: 'ring-rose-200'    },
  amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',   border: 'border-amber-500',   text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',   ring: 'ring-amber-200'   },
};

const SEMINAR_NAV = [
  { num: '01', label: 'Giới thiệu',  path: '/seminar/introduction', active: false  },
  { num: '02', label: 'Lý thuyết',   path: '/seminar/theory',       active: false },
  { num: '03', label: 'Thực nghiệm', path: '/seminar/experiment',   active: true },
  { num: '04', label: 'Kết quả',     path: '/seminar/result',       active: false },
];


// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 font-mono mb-2">
      {children}
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-3xl font-black mb-6 tracking-tighter uppercase italic border-b-4 border-slate-900 inline-block">
      {children}
    </h2>
  );
}

// ─── Filmstrip ────────────────────────────────────────────────────────────────

function FilmstripFrame({ type, index }) {
  const times  = ['0ms', '200ms', '600ms', '1.0s', '1.5s+'];
  const labels = { blank: 'Trắng', content: 'Nội dung', spinner: 'Loading', image: 'Ảnh', done: 'Hoàn chỉnh' };
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-16 h-12 rounded-lg flex items-center justify-center border ${
        type === 'blank'   ? 'bg-slate-700 border-slate-600' :
        type === 'spinner' ? 'bg-slate-800 border-slate-600' :
        type === 'content' ? 'bg-slate-600 border-slate-500' :
        type === 'image'   ? 'bg-slate-500 border-slate-400' :
                             'bg-slate-100 border-slate-300'
      }`}>
        {type === 'spinner' && <div className="w-5 h-5 border-2 border-slate-500 border-t-amber-400 rounded-full animate-spin" />}
        {type === 'content' && (
          <div className="space-y-1 w-10">
            <div className="h-0.5 bg-slate-400 rounded w-full" />
            <div className="h-0.5 bg-slate-400 rounded w-3/4" />
            <div className="h-0.5 bg-slate-500 rounded w-1/2" />
          </div>
        )}
        {type === 'image' && (
          <div className="w-10 h-8 bg-slate-400 rounded flex items-center justify-center">
            <div className="w-6 h-4 bg-slate-300 rounded-sm" />
          </div>
        )}
        {type === 'done' && (
          <div className="space-y-1 w-10">
            <div className="h-2 bg-emerald-400 rounded w-full" />
            <div className="h-0.5 bg-slate-300 rounded w-full" />
            <div className="h-0.5 bg-slate-300 rounded w-3/4" />
          </div>
        )}
      </div>
      <span className="text-[8px] text-slate-400 font-mono">{times[index]}</span>
      <span className="text-[8px] text-slate-300 font-bold">{labels[type]}</span>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col = score >= 90 ? '#10b981' : '#f59e0b';
  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={col} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-black text-slate-800 block leading-none">{score}</span>
        <span className="text-[8px] text-slate-400 font-mono">/100</span>
      </div>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ data }) {
  const c = COLOR[data.color];
  return (
    <div className={`bg-white rounded-2xl border-2 ${c.border} shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`${c.light} px-6 py-4 flex items-center justify-between border-b ${c.border} border-opacity-30`}>
        <div className="flex items-center gap-3">
          <span className={`${c.bg} text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded`}>
            {data.mode}
          </span>
          <div>
            <p className={`text-sm font-black ${c.text} uppercase tracking-tight`}>
              Lighthouse Performance: {data.label}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              SI: {data.si} · TTFB: {data.ttfb} · FCP: {data.fcp} · LCP: {data.lcp}
            </p>
          </div>
        </div>
        <ScoreRing score={data.score} />
      </div>

      <div className="p-6 space-y-5">

        {/* Filmstrip */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
            Filmstrip Timeline (mô phỏng)
          </p>
          <div className="bg-slate-900 rounded-xl p-4 flex items-end gap-3">
            {data.filmstrip.map((type, i) => <FilmstripFrame key={i} type={type} index={i} />)}
            <div className="flex-1 text-right self-start">
              <p className="text-[9px] text-slate-400 leading-relaxed italic max-w-xs ml-auto">
                {data.filmDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'TTFB', value: data.ttfb, desc: 'Server response' },
            { label: 'FCP',  value: data.fcp,  desc: 'First paint' },
            { label: 'LCP',  value: data.lcp,  desc: 'Largest paint' },
            { label: 'SI',   value: data.si,   desc: 'Speed Index' },
          ].map(m => (
            <div key={m.label} className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase font-mono">{m.label}</p>
              <p className="text-base font-black text-slate-800 tabular-nums my-1">{m.value}</p>
              <p className="text-[8px] text-slate-400">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Nguyên nhân */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1">
            Nguyên nhân điểm {data.score >= 90 ? 'cao' : 'bị giảm'}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">{data.scoreReason}</p>
        </div>

        {/* Kết luận + đánh đổi */}
        <div className={`${c.light} rounded-xl p-4 border ${c.border} border-opacity-20 space-y-2`}>
          <p className={`text-[9px] font-black uppercase tracking-widest font-mono ${c.text}`}>Kết luận</p>
          <p className="text-sm text-slate-700 leading-relaxed">{data.conclusion}</p>
          <p className="text-[10px] text-slate-500 font-mono">
            <span className="font-black text-slate-600">Đánh đổi:</span> {data.tradeoff}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ISR vs SSG Demo ─────────────────────────────────────────────────────────

function ISRDemoCard() {
  const [updated, setUpdated] = useState(false);
  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest font-mono mb-0.5">
            So sánh trực quan SSG vs ISR
          </p>
          <p className="text-sm font-black text-slate-800">On-demand Revalidation trong thực tế</p>
        </div>
        <span className="text-2xl">🔄</span>
      </div>
      <div className="p-6">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Minh hoạ: Admin chỉnh sửa tên bài viết từ <code className="bg-slate-100 px-1 rounded">"Thảo Cầm Viên Quận 1 HCM"</code> → <code className="bg-slate-100 px-1 rounded">"Thảo Cầm Viên Quận 1 Hồ Chí Minh"</code>.
          Nhấn nút để mô phỏng webhook kích hoạt.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* SSG card */}
          <div className="border-2 border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">SSG</span>
              <span className="text-[10px] text-slate-500 font-mono">Đóng băng tại build</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-[9px] text-slate-400 font-mono mb-1">title:</p>
              <p className="text-sm font-bold text-slate-800">"Thảo Cầm Viên Quận 1 HCM"</p>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
              Không bao giờ thay đổi. Dù admin đã sửa, SSG vẫn hiển thị tên cũ cho đến khi <code className="bg-slate-100 px-0.5 rounded">npm run build</code>.
            </p>
          </div>

          {/* ISR card */}
          <div className={`border-2 rounded-xl p-4 transition-all duration-500 ${updated ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">ISR</span>
              <span className="text-[10px] text-slate-500 font-mono">On-demand webhook</span>
            </div>
            <div className={`rounded-lg p-3 border transition-all duration-500 ${updated ? 'bg-blue-100 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-[9px] text-slate-400 font-mono mb-1">title:</p>
              <p className={`text-sm font-bold transition-all duration-500 ${updated ? 'text-blue-800' : 'text-slate-800'}`}>
                {updated
                  ? '"Thảo Cầm Viên Quận 1 Hồ Chí Minh"'
                  : '"Thảo Cầm Viên Quận 1 HCM"'}
              </p>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
              {updated
                ? '✅ Webhook đã kích hoạt. Next.js regenerate ngầm. User tiếp theo thấy bản mới.'
                : 'Đang phục vụ bản cached. Chờ webhook từ backend...'}
            </p>
          </div>
        </div>

        {/* Webhook flow */}
        <div className="bg-slate-900 rounded-xl p-4 mb-4">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Webhook Flow</p>
          <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-mono">
            {[
              { label: 'Admin sửa bài', color: 'bg-slate-600' },
              { label: '→' },
              { label: 'postRoutes.js', color: 'bg-slate-700' },
              { label: '→' },
              { label: 'POST /api/revalidate', color: updated ? 'bg-blue-600' : 'bg-slate-700' },
              { label: '→' },
              { label: 'Regenerate HTML', color: updated ? 'bg-blue-500' : 'bg-slate-700' },
              { label: '→' },
              { label: 'Cache mới', color: updated ? 'bg-emerald-600' : 'bg-slate-700' },
            ].map((s, i) =>
              s.color
                ? <span key={i} className={`${s.color} text-white px-2 py-0.5 rounded text-[8px] transition-all duration-500`}>{s.label}</span>
                : <span key={i} className="text-slate-500">{s.label}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setUpdated(u => !u)}
          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
        >
          {updated ? '↺ Reset về bản cũ' : '▶ Kích hoạt Webhook'}
        </button>
      </div>
    </div>
  );
}

// ─── Image Optimisation Section ───────────────────────────────────────────────

function ImageOptSection() {
  const [optimised, setOptimised] = useState(false);
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-0.5">Mục 3.4.1</p>
          <h3 className="text-sm font-black uppercase tracking-tight">Tối ưu hình ảnh với Next/Image + Sharp</h3>
        </div>
        <span className="text-2xl">🖼️</span>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          Hình ảnh thường chiếm phần lớn dung lượng tải xuống của một trang web.
          Đây là nơi dễ dàng cải thiện chỉ số <strong>LCP (Largest Contentful Paint)</strong> nhất.
        </p>

        {/* Before / After toggle */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setOptimised(false)}
              className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${!optimised ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              Trước khi dùng Sharp
            </button>
            <button
              onClick={() => setOptimised(true)}
              className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${optimised ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              Sau khi dùng Sharp
            </button>
          </div>

          <div className={`rounded-xl p-4 border-2 transition-all duration-500 ${optimised ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[9px] font-black uppercase tracking-widest font-mono ${optimised ? 'text-emerald-700' : 'text-red-700'}`}>
                {optimised ? '✅ Sau khi tối ưu' : '⚠️ Trước khi tối ưu'}
              </span>
              <span className={`text-xl font-black tabular-nums ${optimised ? 'text-emerald-700' : 'text-red-600'}`}>
                {optimised ? '354 KiB' : '3,224 KiB'}
              </span>
            </div>

            {/* Bar */}
            <div className="h-3 bg-white rounded-full overflow-hidden border border-current border-opacity-20 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${optimised ? 'bg-emerald-500' : 'bg-red-400'}`}
                style={{ width: optimised ? '11%' : '100%' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-lg p-3 border border-current border-opacity-20">
                <p className="text-[8px] text-slate-400 font-mono mb-1">Thẻ HTML</p>
                <code className={`text-[9px] font-mono font-bold ${optimised ? 'text-emerald-700' : 'text-red-600'}`}>
                  {optimised ? '<Image /> (Next.js)' : '<img /> (truyền thống)'}
                </code>
              </div>
              <div className="bg-white rounded-lg p-3 border border-current border-opacity-20">
                <p className="text-[8px] text-slate-400 font-mono mb-1">Kết quả</p>
                <p className={`text-[9px] font-bold ${optimised ? 'text-emerald-700' : 'text-red-600'}`}>
                  {optimised ? 'Tiết kiệm ~90% dung lượng' : 'Ảnh gốc kích thước đầy đủ'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* next.config explanation */}
        <div className="bg-slate-900 text-white rounded-xl p-4">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2">next.config.mjs — remotePatterns</p>
          <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed">{`images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: '*.digitaloceanspaces.com',
  }]
}`}</pre>
          <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
            Cấu hình này cho phép Sharp lấy và xử lý ảnh an toàn từ DigitalOcean Spaces.
            Ảnh tự động nén và điều chỉnh kích thước cho phù hợp với màn hình.
          </p>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <span className="text-blue-500 text-lg flex-shrink-0">💡</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>priority={'{i === 0}'}</strong> trên ảnh hero đầu tiên của HomeSlider inject một thẻ
            <code className="bg-blue-100 px-1 rounded mx-1">&lt;link rel="preload"&gt;</code>
            vào <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> — browser fetch ảnh trước khi render component,
            cải thiện trực tiếp chỉ số LCP.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Colocation Section ───────────────────────────────────────────────────────

function ColocationSection() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-0.5">Mục 3.4.2</p>
          <h3 className="text-sm font-black uppercase tracking-tight">Tối ưu tốc độ lấy dữ liệu — Full Colocation</h3>
        </div>
        <span className="text-2xl">🚀</span>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          Nút thắt cổ chai lớn nhất trong SSR và CSR thường nằm ở tốc độ I/O giữa các phân hệ.
          Khi Frontend, Backend và Database đặt trên các máy chủ khác nhau, mỗi request phải
          truyền tải qua Internet công cộng — cộng dồn lại làm tăng mạnh TTFB.
        </p>

        {/* Distributed vs Colocated */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50">
            <p className="text-[9px] font-black text-red-700 uppercase tracking-widest font-mono mb-3">❌ Phân tán (Distributed)</p>
            <div className="space-y-2 text-[10px] font-mono">
              {[
                { label: 'Frontend', where: 'Vercel (US)' },
                { label: 'Backend', where: 'Heroku (EU)' },
                { label: 'Database', where: 'MongoDB Atlas (SG)' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between bg-white rounded p-2 border border-red-200">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="text-red-500">{item.where}</span>
                  </div>
                  {i < 2 && <div className="text-center text-red-400 text-lg leading-none">↓ ~50–150ms</div>}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-red-700 font-bold mt-2 text-center">Tổng: 150–300ms mỗi request</p>
          </div>

          <div className="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50">
            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest font-mono mb-3">✅ Colocation (Dự án này)</p>
            <div className="bg-emerald-100 rounded-xl p-4 border-2 border-emerald-300 text-center mb-3">
              <p className="text-[9px] text-emerald-600 font-mono mb-2">DigitalOcean VPS (SGP)</p>
              <div className="space-y-1.5">
                {['Next.js Frontend', 'Express Backend', 'MongoDB'].map((s, i) => (
                  <div key={i} className="bg-emerald-500 text-white text-[9px] font-black rounded px-3 py-1.5 font-mono">
                    {s}
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-emerald-600 mt-2">Giao tiếp qua localhost — không qua Internet</p>
            </div>
            <p className="text-[9px] text-emerald-700 font-bold text-center">Tổng: ~19.8ms mỗi request</p>
          </div>
        </div>

        {/* curl output */}
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-3">
            Terminal Coolify — curl đo thời gian truy vấn nội bộ
          </p>
          <div className="font-mono text-xs space-y-1">
            <p className="text-slate-500">{`$ curl -w "\\nConnect: %{time_connect}s\\nTTFB: %{time_starttransfer}s\\nTotal: %{time_total}s" \\`}</p>
            <p className="text-slate-500 pl-4">{`http://localhost:5123/api/posts/thao-cam-vien-sai-gon`}</p>
            <div className="mt-2 space-y-0.5">
              <p><span className="text-slate-400">Connect:  </span><span className="text-emerald-400 font-bold">0.003618s</span><span className="text-slate-500"> (~3.6 ms)</span></p>
              <p><span className="text-slate-400">TTFB:     </span><span className="text-emerald-400 font-bold">0.019745s</span><span className="text-slate-500"> (~19.7 ms)</span></p>
              <p><span className="text-slate-400">Total:    </span><span className="text-emerald-400 font-bold">0.019798s</span><span className="text-slate-500"> (~19.8 ms)</span></p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Đây là yếu tố then chốt giúp các trang SSR và CSR trong đồ án đạt được tốc độ
          gần với trang tĩnh (SSG/ISR), đảm bảo trải nghiệm người dùng luôn mượt mà.
        </p>
      </div>
    </div>
  );
}

// ─── Real World Section ───────────────────────────────────────────────────────

function RealWorldCard({ data }) {
  const c = COLOR[data.color];
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`${c.light} px-5 py-4 border-b ${c.border} border-opacity-20 flex items-center gap-3`}>
        <span className="text-2xl">{data.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 text-sm">{data.page}</p>
          <code className="text-[9px] text-slate-400 font-mono">{data.path}</code>
        </div>
        <span className={`${c.bg} text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded flex-shrink-0`}>
          {data.mode}
        </span>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1">Lý do lựa chọn</p>
          <p className="text-xs text-slate-600 leading-relaxed">{data.reason}</p>
        </div>
        <div className={`${c.light} rounded-xl p-3 border ${c.border} border-opacity-20`}>
          <p className={`text-[9px] font-black uppercase tracking-widest font-mono mb-1 ${c.text}`}>Cơ chế vận hành</p>
          <p className="text-xs text-slate-600 leading-relaxed">{data.how}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VitalsDoc() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Head><title>Thực Nghiệm Hiệu Năng | Docs</title></Head>
      <Navbar />

      <main className="max-w-5xl mx-auto py-20 px-6 flex-grow w-full space-y-20">

        {/* ── Tiêu đề ── */}
        <div>
          <div className="flex gap-2 mb-10 flex-wrap">
  {SEMINAR_NAV.map(item => (
    <Link key={item.path} href={item.path}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider transition-all ${
          item.active
            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
        }`}
      >
        <span className="opacity-60">{item.num}</span>
        {item.label}
      </div>
    </Link>
  ))}
</div>
          <SectionLabel>Chương 3 — Triển khai & Đánh giá</SectionLabel>
          <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic border-b-8 border-slate-900 inline-block">
            Thực Nghiệm
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-3xl leading-relaxed">
            Toàn bộ hệ thống được triển khai lên môi trường Internet thực tế trước khi đo lường.
            Không đo trên localhost. Công cụ: <strong>Google Lighthouse Desktop</strong>.
          </p>
        </div>

        {/* ── 3.3.1 Hạ tầng ── */}
        <section>
          <SectionLabel>Mục 3.3.1</SectionLabel>
          <SectionTitle>Triển khai hệ thống</SectionTitle>

          <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 grid md:grid-cols-3 gap-4">
            {[
              {
                label: 'Hosting',
                value: 'DigitalOcean VPS',
                sub: 'Máy chủ ảo độc lập',
                desc: 'Tài nguyên xử lý riêng biệt, phản ánh chính xác tốc độ thực tế của hệ thống. Không bị ảnh hưởng bởi các tenant khác.',
              },
              {
                label: 'Automation',
                value: 'Coolify',
                sub: 'Tự quản lý trên VPS',
                desc: 'Tương tự Vercel/Heroku nhưng tự cài trên VPS. Tự động kéo code mới, đóng gói Docker, và khởi chạy cả 3 phân hệ.',
              },
              {
                label: 'Domain',
                value: 'ie213saigonblog.online',
                sub: 'HTTPS + SSL',
                desc: 'Hệ thống đã được cấu hình định tuyến thành công và chạy chính thức dưới tên miền thực tế với SSL.',
              },
            ].map(item => (
              <div key={item.label} className="border border-slate-700 rounded-xl p-5">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-base font-black text-emerald-400 mb-0.5">{item.value}</p>
                <p className="text-[9px] text-slate-500 mb-3">{item.sub}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-blue-500 text-xl flex-shrink-0">🐳</span>
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Coolify</strong> tự động hoá việc kéo mã nguồn mới nhất, đóng gói môi trường (Docker) và
              khởi chạy mượt mà cả 3 phân hệ: <strong>Frontend (Next.js)</strong>, <strong>Backend (ExpressJS)</strong> và
              <strong> Cơ sở dữ liệu (MongoDB)</strong> — tất cả trên cùng một VPS duy nhất.
            </p>
          </div>
        </section>

        {/* ── 3.3.2–3.3.5 Kết quả 4 modes ── */}
        <section>
          <SectionLabel>Mục 3.3.2 – 3.3.5</SectionLabel>
          <SectionTitle>Kết quả đo lường Lighthouse</SectionTitle>
          <div className="space-y-8">
            {RESULTS.map(r => <ResultCard key={r.mode} data={r} />)}
          </div>
        </section>

        {/* ── 3.3.6 Tổng kết ── */}
        <section>
          <SectionLabel>Mục 3.3.6</SectionLabel>
          <SectionTitle>Tổng kết so sánh</SectionTitle>

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {['Mode', 'Score', 'TTFB', 'FCP', 'LCP', 'SI', 'Dữ liệu'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESULTS.map((r, i) => {
                    const c = COLOR[r.color];
                    return (
                      <tr key={r.mode} className={`border-b border-slate-100 ${i % 2 === 0 ? '' : 'bg-slate-50/60'}`}>
                        <td className="px-5 py-4">
                          <span className={`${c.bg} text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded`}>{r.mode}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-lg font-black ${r.score >= 90 ? 'text-emerald-600' : 'text-amber-500'}`}>{r.score}</span>
                          <span className="text-slate-400 text-xs">/100</span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">{r.ttfb}</td>
                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">{r.fcp}</td>
                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">{r.lcp}</td>
                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-700">{r.si}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">{r.data}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
              <h3 className="font-black text-emerald-800 uppercase tracking-tight text-sm mb-2">Về tốc độ tải trang</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>SSG và ISR</strong> chiếm ưu thế tuyệt đối với <strong>92/100</strong> nhờ
                loại bỏ hoàn toàn server compute mỗi request. <strong>SSR và CSR</strong> cùng
                đạt <strong>88/100</strong>, phải đánh đổi bằng độ trễ lấy và xử lý dữ liệu.
              </p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
              <h3 className="font-black text-blue-800 uppercase tracking-tight text-sm mb-2">Về tính cập nhật dữ liệu</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>SSR và CSR</strong> đảm bảo real-time nhưng đánh đổi tốc độ. <strong>SSG</strong> nhanh
                nhất nhưng dữ liệu cố định. <strong>ISR</strong> là giải pháp tối ưu: tốc độ ngang SSG,
                cập nhật on-demand qua webhook mà không rebuild toàn bộ site.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3.4.1 Image optimisation ── */}
        <section>
          <SectionLabel>Mục 3.4 — Phương pháp tối ưu khác</SectionLabel>
          <SectionTitle>Tối ưu hiệu năng bổ sung</SectionTitle>
          <div className="space-y-6">
            <ImageOptSection />
            <ColocationSection />
          </div>
        </section>

        {/* ── 3.5 ISR vs SSG demo ── */}
        <section>
          <SectionLabel>Mục 3.5 (Bổ sung)</SectionLabel>
          <SectionTitle>On-demand ISR trong thực tế</SectionTitle>
          <ISRDemoCard />
        </section>

        {/* ── 3.5 Real world usage ── */}
        <section>
          <SectionLabel>Mục 3.5 — Mô phỏng thực tế</SectionLabel>
          <SectionTitle>Áp dụng từng Rendering vào đúng vị trí</SectionTitle>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-3xl">
            Thay vì áp dụng một kỹ thuật duy nhất cho toàn bộ dự án, mỗi trang nội dung được
            chỉ định một cơ chế kết xuất riêng biệt nhằm giải quyết các bài toán cụ thể về
            tốc độ, khả năng cập nhật dữ liệu và trải nghiệm người dùng.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {REAL_WORLD.map(d => <RealWorldCard key={d.mode + d.page} data={d} />)}
          </div>
        </section>
                    {/* ── Next chapter CTA ── */}
          <div className="border-t border-slate-200">
            <div className="max-w-5xl mx-auto px-6 py-12">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <p className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest mb-2">
                    Tiếp theo
                  </p>
                  <p className="text-slate-900 font-black text-xl">
                    Chương 4: Kết quả & Kết luận
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Tổng hợp số liệu đo lường, phân tích kết quả thực nghiệm và rút ra
                    các kết luận về hiệu quả của 4 rendering mode trong môi trường Cloud
                  </p>
                </div>

                <Link href="/seminar/result"  className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-sm">
                  Kết quả →
                </Link>
              </div>
            </div>
          </div>
      </main>

      <MegaFooter tags={['Lighthouse', 'Performance', 'SSG', 'SSR', 'ISR', 'CSR', 'Sharp', 'Colocation', 'DigitalOcean']} />
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}