import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

// ─── Data from Chương 1 ───────────────────────────────────────────────────────

const PROBLEMS = [
  {
    color: 'rose',
    icon: '🐌',
    title: 'First Load chậm',
    metric: 'LCP cao',
    desc: 'Người dùng phải chờ trình duyệt tải và thực thi toàn bộ JavaScript bundle mới thấy được nội dung. Với SPA thuần CSR, Largest Contentful Paint (LCP) thường vượt quá ngưỡng 4s — Google xếp vào "Poor".',
    csrFlow: ['Browser nhận HTML rỗng', 'Tải JS bundle (~500KB+)', 'React parse & execute', 'fetch() gọi API', 'DOM render nội dung', '← Chỉ đến đây user thấy được gì'],
  },
  {
    color: 'amber',
    icon: '🤖',
    title: 'SEO bị hạn chế',
    metric: 'Googlebot không đọc được',
    desc: 'Các bot tìm kiếm (Google, Bing) crawl trang tại thời điểm HTML được trả về từ server. Với CSR, HTML lúc đó rỗng — bot không thấy title, description, hay nội dung bài viết. Kết quả: trang không được lập chỉ mục đúng cách.',
    csrFlow: ['Googlebot gửi request', 'Server trả HTML rỗng: <div id="__next"></div>', 'Bot không chạy JS', 'Bot thấy trang trống', '→ Không lập chỉ mục nội dung', '→ Không xếp hạng từ khóa'],
  },
];

const OBJECTIVES = [
  {
    num: '01',
    color: 'emerald',
    title: 'Nghiên cứu lý thuyết',
    desc: 'Phân tích cơ chế hoạt động của các chiến lược Rendering hiện đại: SSR, SSG, ISR và CSR — so sánh trực tiếp trên cùng một ứng dụng thực tế.',
    link: '/seminar/theory',
  },
  {
    num: '02',
    color: 'blue',
    title: 'Xây dựng ứng dụng',
    desc: 'Hiện thực hóa Full-stack bằng MENN Stack: MongoDB (database) — Express (backend API) — Next.js (frontend hybrid rendering) — Node.js (runtime).',
    link: '/docs/menn-flow',
  },
  {
    num: '03',
    color: 'violet',
    title: 'Triển khai thực tế',
    desc: 'Thiết lập hệ thống trên VPS DigitalOcean, dùng Coolify orchestrate các Docker containers (Database, Backend, Frontend) — zero third-party PaaS phí.',
    link: '/docs/cloud',
  },
  {
    num: '04',
    color: 'rose',
    title: 'Đo lường & đánh giá',
    desc: 'Sử dụng Lighthouse, PageSpeed Insights và RenderBenchmark component tự build để phân tích hiệu năng thực tế: LCP, TBT, TTFB, FCP, CLS.',
    link: '/seminar/experiment',
  },
];

const SCOPE = {
  subject: [
    'Cơ chế Hybrid Rendering của Next.js và khả năng giao tiếp với Backend Node.js/Express',
    'Quy trình triển khai ứng dụng lên Cloud thông qua VPS và công cụ quản trị Coolify',
    'Các kỹ thuật tối ưu hóa SEO và chỉ số Core Web Vitals',
  ],
  range: [
    'Triển khai ứng dụng trên hạ tầng VPS của DigitalOcean (Singapore region)',
    'Tập trung tối ưu hóa hiển thị và tốc độ phản hồi từ phía Server',
    'Đo lường hiệu năng trong môi trường Cloud thực tế, không phải localhost',
  ],
};

const SIGNIFICANCE = [
  {
    color: 'emerald',
    icon: '🔬',
    type: 'Khoa học',
    title: 'Toàn cảnh Hybrid Rendering',
    desc: 'Cung cấp cái nhìn toàn diện về dòng chảy dữ liệu trong kiến trúc Hybrid Rendering và cách thức các công nghệ hiện đại tương tác để giải quyết bài toán hiệu năng. Minh chứng bằng code thực tế, số liệu đo lường thật.',
  },
  {
    color: 'blue',
    icon: '🏗️',
    type: 'Thực tiễn',
    title: 'Quy trình deployment chuyên nghiệp',
    desc: 'Xây dựng quy trình triển khai ứng dụng Web từ khâu phát triển đến vận hành Cloud với chi phí tối ưu. Git push → auto build → zero-downtime deploy — toàn bộ trên một VPS $18/tháng.',
  },
  {
    color: 'violet',
    icon: '⚡',
    type: 'Kỹ thuật',
    title: 'Next.js + VPS = Best of both',
    desc: 'Minh chứng sức mạnh của việc kết hợp framework hiện đại (Next.js) và hạ tầng VPS trong việc cải thiện trải nghiệm người dùng và thứ hạng SEO — mà không phụ thuộc vào Vercel hay các managed PaaS đắt tiền.',
  },
];

const COLOR_MAP = {
  emerald: { border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', num: 'bg-emerald-100 text-emerald-700' },
  blue:    { border: 'border-blue-200',    text: 'text-blue-700',    bg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',    num: 'bg-blue-100 text-blue-700'    },
  violet:  { border: 'border-violet-200',  text: 'text-violet-700',  bg: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500',  num: 'bg-violet-100 text-violet-700'  },
  rose:    { border: 'border-rose-200',    text: 'text-rose-700',    bg: 'bg-rose-50',    badge: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500',    num: 'bg-rose-100 text-rose-700'    },
  amber:   { border: 'border-amber-200',   text: 'text-amber-700',   bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',   num: 'bg-amber-100 text-amber-700'  },
};

const SEMINAR_NAV = [
  { num: '01', label: 'Giới thiệu',  path: '/seminar/introduction', active: true  },
  { num: '02', label: 'Lý thuyết',   path: '/seminar/theory',       active: false },
  { num: '03', label: 'Thực nghiệm', path: '/seminar/experiment',   active: false },
  { num: '04', label: 'Kết quả',     path: '/seminar/result',       active: false },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400 font-mono">{children}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntroductionPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Head>
        <title>Chương 1: Giới thiệu | Seminar IE213</title>
        <meta name="description" content="Giới thiệu đề tài: Triển khai kiến trúc Hybrid Rendering tối ưu hiệu năng và SEO trong ứng dụng MENN Stack" />
      </Head>
      <Navbar />

      <main className="flex-grow">

        {/* ── Hero ── */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">

            {/* Chapter nav */}
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

            {/* Title */}
            <div className="mb-8">
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-3">Chương 1</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tighter mb-4">
                GIỚI THIỆU<br />
                <span className="text-emerald-600">ĐỀ TÀI</span>
              </h1>
            </div>

            {/* Report title card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-3">Tên đề tài báo cáo</p>
              <p className="text-slate-900 font-black text-lg md:text-xl leading-snug uppercase tracking-tight">
                Triển khai kiến trúc Hybrid Rendering tối ưu hiệu năng và SEO trong ứng dụng{' '}
                <span className="text-emerald-600">MENN Stack</span>
              </p>
              <p className="text-slate-500 text-xs font-mono mt-3">
                MongoDB — Express — Next.js — Node.js · IE213 · UIT · 2026
              </p>
            </div>
          </div>
        </div>

        {/* ── Lý do chọn đề tài ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>1.1 — Lý do chọn đề tài</SectionLabel>

          <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-3xl">
            Trong kỷ nguyên số hiện nay, <span className="text-slate-900 font-bold">trải nghiệm người dùng (UX)</span> và{' '}
            <span className="text-slate-900 font-bold">khả năng tìm kiếm (SEO)</span> là hai yếu tố sống còn của một ứng dụng Web. Kiến trúc truyền thống SPA với CSR tuy mượt mà nhưng gặp phải hai thách thức nghiêm trọng:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {PROBLEMS.map(p => {
              const c = COLOR_MAP[p.color];
              return (
                <div key={p.title} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm overflow-hidden`}>
                  <div className={`border-b ${c.border} p-5 flex items-center gap-4`}>
                    <span className="text-3xl">{p.icon}</span>
                    <div>
                      <h3 className="text-slate-900 font-black text-lg leading-none">{p.title}</h3>
                      <span className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono ${c.badge} px-2 py-0.5 rounded mt-1 inline-block`}>
                        {p.metric}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-600 leading-relaxed mb-5">{p.desc}</p>
                    {/* CSR waterfall */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-3">CSR Waterfall</p>
                      <div className="space-y-1.5">
                        {p.csrFlow.map((step, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono ${step.startsWith('←') || step.startsWith('→') ? c.text + ' font-black' : 'text-slate-400'}`}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className={`text-[10px] font-mono ${step.startsWith('←') || step.startsWith('→') ? c.text + ' font-bold' : 'text-slate-500'}`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solution statement */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <p className="text-[9px] font-black tracking-[0.25em] uppercase font-mono text-emerald-700 mb-3">Giải pháp</p>
            <p className="text-slate-700 leading-relaxed font-medium">
              Kiến trúc <span className="text-emerald-700 font-bold">Hybrid Rendering</span> — kết hợp SSR, SSG, ISR và CSR trong cùng một ứng dụng Next.js — cho phép nhà phát triển lựa chọn phương thức render tối ưu nhất cho <em>từng trang cụ thể</em>. Trang blog dùng ISR (nhanh như tĩnh, data tự cập nhật). Trang search dùng SSR (data realtime). Admin dashboard dùng CSR (không cần SEO). Landing page dùng SSG (build một lần, phục vụ mãi mãi).
            </p>
          </div>
        </div>

        {/* ── Mục tiêu ── */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>1.2 — Mục tiêu của đề tài</SectionLabel>

            <div className="grid md:grid-cols-2 gap-5">
              {OBJECTIVES.map(obj => {
                const c = COLOR_MAP[obj.color];
                return (
                  <Link key={obj.num} href={obj.link} className="group block">
                    <div className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm p-6 h-full hover:shadow-md hover:bg-slate-50 transition-all duration-200`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl ${c.num} flex items-center justify-center font-black font-mono text-sm flex-shrink-0`}>
                          {obj.num}
                        </div>
                        <div>
                          <h3 className={`text-slate-900 font-black text-base mb-2 group-hover:${c.text} transition-colors`}>{obj.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{obj.desc}</p>
                        </div>
                      </div>
                      <div className={`mt-4 text-[9px] font-mono font-bold ${c.text} flex items-center gap-1`}>
                        Xem chi tiết <span>→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Đối tượng & phạm vi ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>1.3 — Đối tượng và phạm vi nghiên cứu</SectionLabel>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6">
              <p className="text-[9px] font-black tracking-[0.25em] uppercase font-mono text-emerald-600 mb-4">Đối tượng nghiên cứu</p>
              <ul className="space-y-3">
                {SCOPE.subject.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-6">
              <p className="text-[9px] font-black tracking-[0.25em] uppercase font-mono text-blue-600 mb-4">Phạm vi nghiên cứu</p>
              <ul className="space-y-3">
                {SCOPE.range.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Ý nghĩa ── */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>1.4 — Ý nghĩa khoa học và thực tiễn</SectionLabel>

            <div className="grid md:grid-cols-3 gap-5">
              {SIGNIFICANCE.map(s => {
                const c = COLOR_MAP[s.color];
                return (
                  <div key={s.type} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className={`text-[9px] font-black font-mono uppercase tracking-widest ${c.text}`}>{s.type}</p>
                        <p className="text-slate-900 font-black text-sm">{s.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Next chapter CTA ── */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <p className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest mb-2">Tiếp theo</p>
              <p className="text-slate-900 font-black text-xl">Chương 2: Lý thuyết</p>
              <p className="text-slate-500 text-sm mt-1">Phân tích chi tiết SSG, SSR, ISR, CSR — cơ chế hoạt động và so sánh trực tiếp</p>
            </div>
            <Link href="/seminar/theory" className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-sm">
              Lý thuyết →
            </Link>
          </div>
        </div>

      </main>

      <MegaFooter tags={[]} />
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}