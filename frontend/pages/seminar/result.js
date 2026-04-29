import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

// ─── Data for Chapter 4 ───────────────────────────────────────────────────────

const CONCLUSIONS = [
  {
    title: 'Tối ưu hóa hiệu năng vượt trội',
    color: 'emerald',
    icon: '🚀',
    desc: 'Nhờ chiến lược Colocation (đặt Cơ sở dữ liệu và Backend cùng một máy chủ nội bộ), hệ thống đã triệt tiêu được độ trễ mạng Internet.',
    detail: 'Các chỉ số thực nghiệm cho thấy thời gian phản hồi đạt mức cực thấp, giúp trang web đạt điểm số ấn tượng.',
    metrics: [
      { label: 'TTFB Nội bộ', value: '~19ms' },
      { label: 'TTFB SSR Thực tế', value: '~44ms' },
      { label: 'Lighthouse', value: '92' }
    ]
  },
  {
    title: 'Kiến trúc linh hoạt',
    color: 'blue',
    icon: '🧩',
    desc: 'Việc áp dụng On-demand Revalidation cho trang chủ đã giải quyết được nội dung khó nhất trong dự án.',
    detail: 'Hệ thống vừa giữ được tốc độ tức thì của trang tĩnh (SSG), vừa đảm bảo dữ liệu luôn mới nhất ngay khi có thay đổi (Webhook).',
    metrics: [
      { label: 'Tốc độ', value: 'Như trang tĩnh' },
      { label: 'Cập nhật', value: 'Tự động ngầm' },
      { label: 'Dữ liệu', value: 'Luôn mới' }
    ]
  },
  {
    title: 'Trải nghiệm người dùng đồng nhất',
    color: 'violet',
    icon: '🎨',
    desc: 'Hệ thống không chỉ đáp ứng tốt về mặt kỹ thuật mà còn đảm bảo giao diện hiển thị cực kỳ mượt mà.',
    detail: 'Từ các trang nội dung tĩnh cho đến các công cụ quản trị (Dashboard) yêu cầu tính tương tác cao, người dùng không gặp bất kỳ độ trễ nào.',
    metrics: [
      { label: 'Trang tĩnh', value: 'Tốc độ CDN' },
      { label: 'Dashboard', value: 'Như App Desktop' },
      { label: 'Chuyển trang', value: 'Preload mượt' }
    ]
  }
];

const LESSONS = [
  {
    title: 'Vị trí đặt dữ liệu là then chốt',
    highlight: 'Network Latency > CPU Power',
    icon: '📍',
    color: 'rose',
    desc: 'Đối với các ứng dụng sử dụng nhiều SSR/ISR, độ trễ giữa Backend và Database (Network Latency) quan trọng hơn nhiều so với sức mạnh thuần túy của CPU. Việc chuyển từ Cloud Database phân tán về Database cục bộ trên cùng VPS là bước ngoặt giúp tăng tốc độ hệ thống lên gấp 10 lần.'
  },
  {
    title: 'Không có phương pháp tốt nhất',
    highlight: 'Right Tool for Right Job',
    icon: '⚖️',
    color: 'amber',
    desc: 'Mỗi phương pháp (SSG, SSR, ISR, CSR) đều có ưu và nhược điểm riêng. Kỹ năng của người phát triển nằm ở việc phân tích đúng tính chất của từng trang (tần suất cập nhật, yêu cầu SEO, tính bảo mật) để chọn kỹ thuật phù hợp nhất, thay vì cố gắng áp dụng một phương pháp duy nhất.'
  }
];

const FUTURE_WORK = [
  {
    title: 'Mở rộng bộ nhớ đệm (Edge Caching)',
    icon: '🌐',
    color: 'emerald',
    desc: 'Tích hợp thêm các dịch vụ như Cloudflare để đẩy các trang tĩnh (SSG/ISR) đến gần người dùng hơn nữa ở các vị trí địa lý khác nhau, giảm tải cho máy chủ gốc.'
  },
  {
    title: 'Tích hợp Trí tuệ nhân tạo (AI)',
    icon: '🤖',
    color: 'blue',
    desc: 'Tận dụng các mô hình ngôn ngữ lớn (LLM) để tự động hóa việc tóm tắt bài viết hoặc tạo nội dung mô tả cho các địa danh trực tiếp trong trang quản trị.'
  }
];

const COLOR = {
  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  blue:    { bg: 'bg-blue-500',    light: 'bg-blue-50',    border: 'border-blue-500',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700'    },
  violet:  { bg: 'bg-violet-500',  light: 'bg-violet-50',  border: 'border-violet-500',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-700'  },
  rose:    { bg: 'bg-rose-500',    light: 'bg-rose-50',    border: 'border-rose-500',    text: 'text-rose-700',    badge: 'bg-rose-100 text-rose-700'    },
  amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',   border: 'border-amber-500',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700'   },
};

const SEMINAR_NAV = [
  { num: '01', label: 'Giới thiệu',  path: '/seminar/introduction', active: false },
  { num: '02', label: 'Lý thuyết',   path: '/seminar/theory',       active: false },
  { num: '03', label: 'Thực nghiệm', path: '/seminar/experiment',   active: false },
  { num: '04', label: 'Kết quả',     path: '/seminar/result',       active: true  },
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

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ResultDoc() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Head>
        <title>Chương 4: Kết luận & Khuyến nghị | Docs</title>
      </Head>
      <Navbar />

      <main className="max-w-5xl mx-auto py-20 px-6 flex-grow w-full space-y-20">

        {/* ── Nav & Tiêu đề Hero ── */}
        <div>
          {/* Chapter nav adapted for light mode */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {SEMINAR_NAV.map(item => (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider transition-all ${
                  item.active
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
                }`}>
                  <span className="opacity-60">{item.num}</span>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          <SectionLabel>Chương 4 — Tổng kết dự án</SectionLabel>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic border-b-8 border-slate-900 inline-block">
            Kết Luận
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-3xl leading-relaxed mt-2">
            Dự án Hệ Thống Blog đã hoàn thành mục tiêu đề ra là xây dựng một hệ thống web hiện đại,
            minh họa sinh động sự phối hợp giữa 4 phương pháp Rendering phổ biến nhất hiện nay:
            <strong> ISR, SSG, SSR và CSR.</strong>
          </p>
        </div>

        {/* ── 4.1 Kết luận ── */}
        <section>
          <SectionLabel>Mục 4.1</SectionLabel>
          <SectionTitle>Kết quả đạt được</SectionTitle>
          <div className="space-y-8">
            {CONCLUSIONS.map((item, index) => {
              const c = COLOR[item.color];
              return (
                <div key={index} className={`bg-white rounded-2xl border-2 ${c.border} shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
                  {/* Card Header */}
                  <div className={`${c.light} px-6 py-4 flex items-center gap-4 border-b ${c.border} border-opacity-30`}>
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h3 className={`text-base font-black uppercase tracking-tight ${c.text}`}>{item.title}</h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Mục tiêu {index + 1}</p>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 grid md:grid-cols-5 gap-6 items-center">
                    <div className="md:col-span-3 space-y-3">
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.desc}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed italic">{item.detail}</p>
                    </div>
                    
                    {/* Metrics Grid */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
                      {item.metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between md:justify-start md:gap-4">
                          <span className="text-[9px] font-black text-slate-400 uppercase font-mono tracking-widest">{m.label}</span>
                          <span className={`text-sm font-black tabular-nums ${c.text}`}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4.2 Bài học rút ra ── */}
        <section>
          <SectionLabel>Mục 4.2</SectionLabel>
          <SectionTitle>Bài học kỹ thuật</SectionTitle>
          
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-10 grid md:grid-cols-2 gap-8 shadow-xl">
            {LESSONS.map((lesson, i) => {
              const c = COLOR[lesson.color];
              return (
                <div key={i} className="relative flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-xl flex-shrink-0 border border-white/20 shadow-inner`}>
                      {lesson.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-base md:text-lg">{lesson.title}</h4>
                      <code className={`text-[9px] font-bold ${c.text} font-mono uppercase tracking-widest block mt-0.5`}>
                        {lesson.highlight}
                      </code>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 flex-grow">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lesson.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4.3 Khuyến nghị & Hướng phát triển ── */}
        <section>
          <SectionLabel>Mục 4.3</SectionLabel>
          <SectionTitle>Hướng phát triển tương lai</SectionTitle>
          
          <div className="grid md:grid-cols-2 gap-6">
            {FUTURE_WORK.map((item, i) => {
              const c = COLOR[item.color];
              return (
                <div key={i} className={`${c.light} border-2 ${c.border} rounded-2xl p-6 shadow-sm`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl drop-shadow-sm">{item.icon}</span>
                    <h3 className={`font-black uppercase tracking-tight text-sm ${c.text}`}>{item.title}</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-white shadow-sm opacity-90">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Final Message Block ── */}
        <section>
          <div className="border-4 border-slate-900 rounded-3xl p-8 md:p-12 text-center bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-2xl md:text-3xl font-black mb-3 italic uppercase tracking-tighter text-slate-900">
              Kết thúc đồ án — Mở ra hệ sinh thái
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Kiến trúc Hybrid Rendering không chỉ dừng lại ở một công nghệ đơn lẻ, mà là một tư duy linh hoạt trong việc cân bằng giữa <strong>Hiệu suất (Performance)</strong> và <strong>Chi phí tính toán (Compute Cost)</strong>. Dự án IE213 đã chứng minh rằng việc phối hợp chính xác các mô hình render hoàn toàn có thể mang lại trải nghiệm tiệm cận sự hoàn hảo.
            </p>
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              {['MENN Stack', 'Colocation', 'Web Vitals', 'DigitalOcean'].map((tag) => (
                <span key={tag} className="bg-slate-100 text-slate-500 font-black font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
              {/* ── Return to introduction CTA ── */}
<div className="border-t border-slate-200">
  <div className="max-w-5xl mx-auto px-6 py-12">
    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
      <div>
        <p className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest mb-2">
          Xem lại từ đầu
        </p>
        <p className="text-slate-900 font-black text-xl">
          Chương 1: Giới thiệu đề tài
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Quay lại phần mở đầu để xem bối cảnh nghiên cứu, mục tiêu đề tài 
          và động lực hình thành kiến trúc Hybrid Rendering trong MENN Stack
        </p>
      </div>

      <Link
        href="/seminar/introduction"
        className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-sm"
      >
        ← Giới thiệu
      </Link>
    </div>
  </div>
</div>
      </main>

      <MegaFooter tags={['Kết luận', 'Bài học', 'Khuyến nghị', 'Tương lai', 'IE213']} />
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}