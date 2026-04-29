import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

// ─── Data from Chương 2 ───────────────────────────────────────────────────────

const MENN_STACK = [
  {
    letter: 'M',
    name: 'MongoDB',
    color: 'emerald',
    role: 'Database',
    desc: 'Hệ quản trị cơ sở dữ liệu NoSQL dựa trên tài liệu (document-oriented), cung cấp sự linh hoạt trong việc lưu trữ và truy xuất dữ liệu dưới dạng JSON. Schema-less — phù hợp với blog posts có cấu trúc thay đổi.',
    why: 'Không cần migration khi thêm field mới vào post. Mongoose ODM cung cấp validation, pre-save hooks và virtual fields.',
    tech: ['Mongoose v8', 'Document model', 'Coolify managed', 'Docker internal network'],
  },
  {
    letter: 'E',
    name: 'Express.js',
    color: 'blue',
    role: 'Backend API',
    desc: 'Framework web tối giản cho Node.js, đóng vai trò xây dựng hệ thống RESTful API để xử lý các logic nghiệp vụ ở phía Backend: CRUD bài viết, xác thực user, upload ảnh lên Spaces CDN.',
    why: 'Middleware architecture cho phép xếp chồng: cors → auth → multer → controller. Dễ thêm route mới mà không ảnh hưởng existing logic.',
    tech: ['REST API', 'JWT Auth', 'Multer upload', 'Mongoose integration'],
  },
  {
    letter: 'N',
    name: 'Next.js',
    color: 'violet',
    role: 'Rendering Engine',
    desc: 'Framework React dành cho Production. Đây là thành phần quan trọng nhất — đóng vai trò "Rendering Engine" cho phép thực hiện các chiến lược SSG, SSR, ISR và CSR trên cùng một ứng dụng.',
    why: 'Không có framework nào khác cho phép một trang dùng SSG và trang kề dùng SSR trong cùng codebase mà không cần config phức tạp.',
    tech: ['SSG / SSR / ISR / CSR', 'API Routes (BFF)', 'Image Optimization', 'File-based routing'],
  },
  {
    letter: 'N',
    name: 'Node.js',
    color: 'rose',
    role: 'Runtime',
    desc: 'Môi trường thực thi JavaScript phía Server — nền tảng chung cho cả Express backend và các tác vụ server-side của Next.js. Non-blocking I/O model phù hợp với ứng dụng nhiều concurrent request.',
    why: 'Dùng cùng ngôn ngữ (JavaScript) cho cả Frontend và Backend — giảm context switching, tái sử dụng utility functions và type definitions.',
    tech: ['v20 LTS', 'Non-blocking I/O', 'npm ecosystem', 'Shared JS codebase'],
  },
];

const REACT_LIMITS = [
  {
    color: 'rose',
    icon: '📄',
    title: '"Trang trắng" (Blank Page Problem)',
    desc: 'Với React thuần (SPA), trình duyệt nhận một file HTML rỗng và một tệp JavaScript lớn. Người dùng phải chờ JS thực thi xong mới thấy nội dung — tăng chỉ số FCP (First Contentful Paint) lên mức "Poor" theo chuẩn Google.',
    code: `<!-- HTML React SPA nhận được từ server -->
<!DOCTYPE html>
<html>
  <head>
    <script src="/assets/index-Bx3fG2kP.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <!-- Trống rỗng — không có nội dung nào -->
  </body>
</html>`,
    stat: '635.83KB JS bundle — vượt ngưỡng 200KB của Lighthouse gấp 3 lần',
  },
  {
    color: 'amber',
    icon: '🤖',
    title: 'Thách thức SEO',
    desc: 'Googlebot thường không đợi JavaScript render xong. Khi crawl trang SPA, bot chỉ thấy <div id="root"></div> — không có title, description, hay nội dung bài viết. Kết quả: trang không được lập chỉ mục đúng cách, mất thứ hạng tìm kiếm.',
    code: `// Googlebot thấy gì khi crawl CSR page:
GET /posts/bitexco-quan-1

Response HTML:
<div id="root"></div>
← Trống. Không có title, h1, p nào.

// Vs Next.js SSG/ISR:
<h1>Bitexco Financial Tower</h1>
<p>Tòa nhà biểu tượng của Quận 1...</p>
← Bot đọc được ngay, lập chỉ mục đầy đủ.`,
    stat: 'SEO score CSR ≈ 40/100 · SSG/ISR/SSR ≈ 100/100 theo Lighthouse',
  },
  {
    color: 'slate',
    icon: '📦',
    title: 'Bundle Size & Third-party Overhead',
    desc: 'React SPA yêu cầu cài thêm nhiều thư viện bên thứ ba: react-router-dom (routing), tanstack-query (data fetching), axios (HTTP). Mỗi thư viện thêm vào bundle — parse time tăng, TBT tăng.',
    code: `// React SPA cần cài thêm:
npm install react-router-dom    // +50KB
npm install @tanstack/react-query // +40KB
npm install axios               // +30KB

// Next.js có sẵn:
// ✓ File-based routing (zero config)
// ✓ getStaticProps / getServerSideProps
// ✓ fetch() native với cache control
// ✓ API Routes (không cần axios)`,
    stat: '~120KB dependency overhead bị loại bỏ hoàn toàn',
  },
];

const NEXTJS_ADVANTAGES = [
  {
    color: 'emerald',
    icon: '🔀',
    title: 'Hybrid Power',
    desc: 'Next.js không ép buộc toàn bộ ứng dụng phải theo một cơ chế render duy nhất. Mỗi trang có thể độc lập chọn chiến lược render tối ưu nhất.',
    example: [
      { page: '/ssg/homepage', mode: 'SSG', reason: 'Landing page — data ít đổi, cần load cực nhanh' },
      { page: '/isr/homepage', mode: 'ISR', reason: 'Blog list — cập nhật định kỳ, không rebuild toàn site' },
      { page: '/ssr/homepage', mode: 'SSR', reason: 'Search results — data realtime theo query' },
      { page: '/csr/homepage', mode: 'CSR', reason: 'Demo SPA — minh họa hạn chế của CSR' },
      { page: '/admin/dashboard', mode: 'CSR', reason: 'Admin — không cần SEO, nhiều interaction' },
    ],
  },
  {
    color: 'blue',
    icon: '⚡',
    title: 'Zero Config Optimization',
    desc: 'Next.js tích hợp sẵn các tối ưu hóa mà React SPA phải tự cấu hình hoặc cài thêm thư viện.',
    items: [
      { name: 'Image Optimization', detail: 'Tự động nén, resize và chuyển sang WebP. <Image> component tự set width/height → tránh CLS.' },
      { name: 'Automatic Code Splitting', detail: 'Mỗi route có JS chunk riêng. Trang /posts/[slug] không tải JS của /admin.' },
      { name: 'Link Prefetching', detail: '<Link> component tự prefetch trang đích khi người dùng hover → chuyển trang tức thì.' },
      { name: 'Font Optimization', detail: 'next/font tự host Google Fonts — loại bỏ external request, tránh FOUT (Flash of Unstyled Text).' },
    ],
  },
  {
    color: 'violet',
    icon: '🔒',
    title: 'API Routes — BFF Pattern',
    desc: 'Next.js cho phép viết API trung gian (Backend for Frontend) ngay trong codebase frontend. Trong dự án này, API routes đóng vai trò proxy bảo mật — browser không bao giờ biết địa chỉ Express backend.',
    code: `// pages/api/blog-proxy.js
// Browser gọi /api/blog-proxy
// Next.js server gọi Express backend (internal)
// Browser không bao giờ thấy INTERNAL_BACKEND_URL

export default async function handler(req, res) {
  const BACKEND = process.env.INTERNAL_BACKEND_URL;
  const data = await fetch(\`\${BACKEND}/api/posts\`);
  res.json(await data.json());
}`,
  },
];

const RENDERING_MODES = [
  {
    id: 'SSG',
    num: '2.3.1',
    color: 'emerald',
    icon: '📦',
    title: 'Static Site Generation (SSG)',
    timing: 'Build time',
    pros: ['Tốc độ truy cập cực nhanh — serve từ CDN', 'Bảo mật cao — không có server-side code lúc runtime', 'TTFB thấp nhất trong 4 phương pháp'],
    cons: ['Không phù hợp với dữ liệu thay đổi thường xuyên', 'Mọi thay đổi nội dung yêu cầu build lại toàn bộ'],
    bestFor: 'Trang giới thiệu (About Us), Landing Page quảng cáo, Tài liệu hướng dẫn kỹ thuật (Docs)',
    hook: 'getStaticProps()',
    flow: ['Build time: Next.js chạy getStaticProps()', 'Fetch data từ Express backend', 'Render HTML hoàn chỉnh → lưu file', 'Deploy: upload HTML tĩnh lên server', 'Request: Traefik serve file tĩnh ngay lập tức', 'Browser nhận HTML đầy đủ — không cần server compute'],
  },
  {
    id: 'SSR',
    num: '2.3.2',
    color: 'rose',
    icon: '🍜',
    title: 'Server-Side Rendering (SSR)',
    timing: 'Mỗi request',
    pros: ['Dữ liệu luôn được cập nhật mới nhất', 'SEO tuyệt đối — HTML có sẵn nội dung', 'Phù hợp với data cá nhân hóa theo user'],
    cons: ['Tăng tải cho Server (CPU/RAM) mỗi request', 'TTFB cao hơn do phải đợi Server xử lý và query DB'],
    bestFor: 'Trang kết quả tìm kiếm, Bảng tin mạng xã hội, Trang giá vàng/chứng khoán realtime',
    hook: 'getServerSideProps()',
    flow: ['Request đến từ browser', 'Next.js server chạy getServerSideProps()', 'Express backend query MongoDB', 'Mongoose hydrate documents', 'Next.js render HTML với data mới', 'Browser nhận HTML đầy đủ — TTFB = thời gian xử lý trên'],
  },
  {
    id: 'CSR',
    num: '2.3.3',
    color: 'amber',
    icon: '🛒',
    title: 'Client-Side Rendering (CSR)',
    timing: 'Sau khi JS bundle load',
    pros: ['Tương tác mượt mà sau khi tải — SPA experience', 'Giảm tải cho Server sau khi page đã load xong', 'Phù hợp cho UI phức tạp, nhiều state'],
    cons: ['Tốc độ tải trang đầu tiên chậm — "Trang trắng"', 'SEO kém — Bot khó lập chỉ mục nội dung từ JS'],
    bestFor: 'Dashboard quản trị, Trang cài đặt tài khoản, Ứng dụng quản lý công việc nằm sau login',
    hook: 'useEffect() + fetch()',
    flow: ['Request đến từ browser', 'Server trả HTML rỗng ngay lập tức', 'Browser tải JS bundle (~500KB+)', 'React parse, compile, execute bundle', 'useEffect chạy, gọi fetch()', 'State update → DOM render — Chỉ đến đây user thấy nội dung'],
  },
  {
    id: 'ISR',
    num: '2.3.4',
    color: 'blue',
    icon: '🍖',
    title: 'Incremental Static Regeneration (ISR)',
    timing: 'Build time + background revalidate',
    pros: ['Kết hợp tốc độ SSG và tính cập nhật SSR', 'Không cần rebuild toàn bộ site khi data thay đổi', 'Giảm tải tối đa cho Server và Database'],
    cons: ['Có độ trễ về tính cập nhật — user đầu tiên sau hết cache có thể thấy data cũ trong khi trang đang được tái tạo'],
    bestFor: 'Trang chi tiết sản phẩm thương mại điện tử, Bài viết Blog/Tin tức, Danh mục sản phẩm',
    hook: 'getStaticProps() + revalidate',
    flow: ['Request 1: Serve HTML tĩnh đã build (nhanh như SSG)', 'Nếu quá revalidate interval → kích hoạt background regen', 'Background: fetch data mới từ Express', 'Next.js rebuild HTML mới ở background', 'Request 2+: Serve HTML mới — user không biết gì', 'On-demand: Admin tạo bài → webhook → force revalidate ngay'],
  },
];

const INFRA = [
  {
    color: 'emerald',
    icon: '🌊',
    title: 'VPS & DigitalOcean',
    section: '2.4.1',
    points: [
      'Máy chủ ảo riêng (VPS) — toàn quyền kiểm soát từ hệ điều hành đến cấu hình mạng',
      'Droplet SGP1 (Singapore) — latency đến HCM City < 15ms',
      'Phân bổ tài nguyên tối ưu: toàn bộ stack (Frontend + Backend + DB) trên 1 Droplet $18/tháng',
      'Không bị giới hạn bởi platform rules của Vercel hay Heroku',
    ],
  },
  {
    color: 'blue',
    icon: '🐳',
    title: 'Docker & Coolify',
    section: '2.4.2',
    points: [
      'Docker: Đóng gói ứng dụng vào Container — đảm bảo chạy đồng nhất trên mọi môi trường (Local → Staging → Production)',
      'Coolify: Self-hosted PaaS — tự động hóa cấu hình Traefik, cấp phát SSL (Let\'s Encrypt), CI/CD từ GitHub',
      'Nixpacks: Auto-detect build system — không cần viết Dockerfile thủ công',
      'Zero-downtime deploy: Health check trước khi switch traffic sang container mới',
    ],
  },
];

const VITALS_SUMMARY = [
  { name: 'LCP', full: 'Largest Contentful Paint', target: '< 2.5s', desc: 'Thời gian hiển thị phần tử nội dung lớn nhất', color: 'emerald' },
  { name: 'FID', full: 'First Input Delay',         target: '< 100ms', desc: 'Thời gian phản hồi khi người dùng tương tác lần đầu', color: 'blue' },
  { name: 'CLS', full: 'Cumulative Layout Shift',   target: '< 0.1',  desc: 'Độ ổn định của bố cục trang web', color: 'violet' },
];

const COLOR_MAP = {
  emerald: { border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', num: 'bg-emerald-100 text-emerald-700' },
  blue:    { border: 'border-blue-200',    text: 'text-blue-700',    bg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',    num: 'bg-blue-100 text-blue-700'    },
  violet:  { border: 'border-violet-200',  text: 'text-violet-700',  bg: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500',  num: 'bg-violet-100 text-violet-700'  },
  rose:    { border: 'border-rose-200',    text: 'text-rose-700',    bg: 'bg-rose-50',    badge: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500',    num: 'bg-rose-100 text-rose-700'    },
  amber:   { border: 'border-amber-200',   text: 'text-amber-700',   bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',   num: 'bg-amber-100 text-amber-700'  },
  slate:   { border: 'border-slate-200',   text: 'text-slate-700',   bg: 'bg-slate-50',   badge: 'bg-slate-100 text-slate-700',  dot: 'bg-slate-500',   num: 'bg-slate-100 text-slate-700'  },
};

const MODE_COLOR = { SSG: 'text-emerald-600', ISR: 'text-blue-600', SSR: 'text-rose-600', CSR: 'text-amber-600' };

const SEMINAR_NAV = [
  { num: '01', label: 'Giới thiệu',  path: '/seminar/introduction', active: false },
  { num: '02', label: 'Lý thuyết',   path: '/seminar/theory',       active: true  },
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

function RenderingCard({ mode }) {
  const c = COLOR_MAP[mode.color];
  return (
    <div className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`border-b ${c.border} bg-slate-50 p-5`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${c.num} flex items-center justify-center font-black font-mono text-xs flex-shrink-0 text-center`}>
              <span>{mode.id}</span>
            </div>
            <div>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{mode.num}</p>
              <h3 className="text-slate-900 font-black text-base leading-tight">{mode.title}</h3>
              <span className={`text-[9px] font-mono font-bold ${c.badge} px-2 py-0.5 rounded mt-1 inline-block`}>
                Khi nào render: {mode.timing}
              </span>
            </div>
          </div>
          <span className="text-3xl">{mode.icon}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 grid md:grid-cols-3 gap-5">
        {/* Pros & Cons */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-3">Ưu / Nhược điểm</p>
          <div className="space-y-1.5 mb-4">
            {mode.pros.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                {p}
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {mode.cons.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                <span className="text-rose-500 flex-shrink-0 mt-0.5">✕</span>
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Best for + hook */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-3">Phù hợp cho</p>
          <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{mode.bestFor}</p>
          <div className={`inline-flex items-center gap-2 ${COLOR_MAP[mode.color].badge} px-3 py-1.5 rounded-lg border border-opacity-50`}>
            <span className="text-[8px] font-mono uppercase tracking-widest">Next.js hook</span>
            <code className="text-[11px] font-black">{mode.hook}</code>
          </div>
        </div>

        {/* Flow waterfall */}
        <div className={`${COLOR_MAP[mode.color].bg} rounded-xl p-4 border border-opacity-50`}>
          <p className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono mb-3 ${COLOR_MAP[mode.color].text}`}>
            Request Flow
          </p>
          <div className="space-y-1.5">
            {mode.flow.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[8px] text-slate-500 font-mono flex-shrink-0 w-4">{i + 1}.</span>
                <span className={`text-[10px] font-mono leading-snug ${
                  i === mode.flow.length - 1 ? COLOR_MAP[mode.color].text + ' font-bold' : 'text-slate-600'
                }`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TheoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Head>
        <title>Chương 2: Lý thuyết | Seminar IE213</title>
        <meta name="description" content="Cơ sở lý thuyết: MENN Stack, Hybrid Rendering (SSG/SSR/ISR/CSR), Docker, Coolify, Core Web Vitals" />
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

            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-3">Chương 2</p>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tighter mb-6">
              CƠ SỞ<br />
              <span className="text-emerald-600">LÝ THUYẾT</span>
            </h1>
            <p className="text-slate-600 text-base max-w-2xl leading-relaxed font-medium">
              Nền tảng lý thuyết của đề tài: MENN Stack, tại sao Next.js thay thế React thuần, các cơ chế Hybrid Rendering, hạ tầng triển khai Docker/Coolify và bộ chỉ số Core Web Vitals.
            </p>
          </div>
        </div>

        {/* ── 2.1 MENN Stack ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>2.1 — Tổng quan về MENN Stack</SectionLabel>

          <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-3xl">
            MENN Stack là biến thể hiện đại của MERN Stack truyền thống, thay thế React thuần túy bằng <span className="text-slate-900 font-bold">Next.js</span> — framework cho phép Hybrid Rendering. Đây là nền tảng kỹ thuật của toàn bộ đề tài.
          </p>

          {/* Stack banner */}
          <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto">
            {MENN_STACK.map((item, i) => {
              const c = COLOR_MAP[item.color];
              return (
                <div key={item.letter} className="flex items-center">
                  <div className={`${c.bg} border-2 ${c.border} rounded-2xl px-6 py-4 text-center min-w-[90px] shadow-sm`}>
                    <span className={`text-4xl font-black ${c.text} font-mono block`}>{item.letter}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1 block">{item.role}</span>
                  </div>
                  {i < MENN_STACK.length - 1 && (
                    <div className="w-8 h-px bg-slate-300 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {MENN_STACK.map(item => {
              const c = COLOR_MAP[item.color];
              return (
                <div key={item.name} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${c.num} flex items-center justify-center font-black font-mono text-xl flex-shrink-0`}>
                      {item.letter}
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-black text-base leading-none">{item.name}</h3>
                      <span className={`text-[9px] font-mono font-bold ${c.text} uppercase tracking-wider`}>{item.role}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.desc}</p>
                  <div className={`${c.bg} rounded-lg p-3 mb-3 border border-opacity-50`}>
                    <p className={`text-[9px] font-mono font-bold uppercase tracking-widest ${c.text} mb-1`}>Tại sao chọn?</p>
                    <p className="text-xs text-slate-600 font-medium">{item.why}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tech.map(t => (
                      <span key={t} className={`text-[9px] font-mono font-bold ${c.badge} px-2 py-0.5 rounded border border-opacity-50`}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2.2 React vs Next.js ── */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>2.2 — Tại sao Next.js thay vì React thuần túy (SPA)?</SectionLabel>

            <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-3xl">
              Mặc dù Next.js xây dựng trên nền React, nhưng React SPA bộc lộ nhiều hạn chế mà Next.js khắc phục triệt để trong bài toán tối ưu hiệu năng và SEO.
            </p>

            {/* 2.2.1 Limitations */}
            <p className="text-[10px] font-black tracking-[0.2em] uppercase font-mono text-slate-400 mb-5">2.2.1 — Hạn chế của React SPA</p>
            <div className="flex flex-col gap-5 mb-12">
              {REACT_LIMITS.map(item => {
                const c = COLOR_MAP[item.color];
                return (
                  <div key={item.title} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm overflow-hidden`}>
                    <div className={`border-b ${c.border} bg-slate-50 p-5 flex items-center gap-3`}>
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="text-slate-900 font-black text-base">{item.title}</h4>
                        <span className={`text-[9px] font-mono font-bold ${c.badge} px-2 py-0.5 rounded mt-1 inline-block`}>{item.stat}</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="p-5">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                      <div className="border-l border-slate-200 bg-slate-50">
                        <pre className="px-5 py-5 text-[10px] font-mono text-slate-700 overflow-x-auto leading-relaxed">
                          <code>{item.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2.2.2 Next.js advantages */}
            <p className="text-[10px] font-black tracking-[0.2em] uppercase font-mono text-slate-400 mb-5">2.2.2 — Ưu thế vượt trội của Next.js</p>
            <div className="flex flex-col gap-5">
              {NEXTJS_ADVANTAGES.map(adv => {
                const c = COLOR_MAP[adv.color];
                return (
                  <div key={adv.title} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{adv.icon}</span>
                      <div>
                        <h4 className="text-slate-900 font-black text-base">{adv.title}</h4>
                        <p className="text-sm text-slate-600 mt-0.5 font-medium">{adv.desc}</p>
                      </div>
                    </div>

                    {/* Hybrid example table */}
                    {adv.example && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                              <th className="text-left px-4 py-3 text-[8px] text-slate-500 font-black uppercase tracking-widest">Page</th>
                              <th className="text-left px-4 py-3 text-[8px] text-slate-500 font-black uppercase tracking-widest">Mode</th>
                              <th className="text-left px-4 py-3 text-[8px] text-slate-500 font-black uppercase tracking-widest">Lý do</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adv.example.map((row, i) => (
                              <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                                <td className="px-4 py-3 text-slate-600 font-bold">{row.page}</td>
                                <td className={`px-4 py-3 font-black ${MODE_COLOR[row.mode]}`}>{row.mode}</td>
                                <td className="px-4 py-3 text-slate-500">{row.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Items list */}
                    {adv.items && (
                      <div className="grid md:grid-cols-2 gap-3">
                        {adv.items.map(item => (
                          <div key={item.name} className={`${c.bg} border border-opacity-50 rounded-xl p-3`}>
                            <p className={`text-[9px] font-black font-mono uppercase tracking-wider ${c.text} mb-1`}>{item.name}</p>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code block */}
                    {adv.code && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mt-3 shadow-sm">
                        <pre className="px-5 py-4 text-[10px] font-mono text-slate-700 overflow-x-auto leading-relaxed">
                          <code>{adv.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2.3 Rendering modes ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>2.3 — Các cơ chế Rendering trong phát triển Web hiện đại</SectionLabel>

          <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-3xl">
            Cốt lõi của Hybrid Rendering là khả năng kết hợp linh hoạt bốn phương thức sau trên cùng một ứng dụng Next.js:
          </p>

          <div className="flex flex-col gap-6">
            {RENDERING_MODES.map(mode => <RenderingCard key={mode.id} mode={mode} />)}
          </div>
        </div>

        {/* ── 2.4 Infrastructure ── */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>2.4 — Hạ tầng triển khai và Quản lý Container</SectionLabel>

            <div className="grid md:grid-cols-2 gap-6">
              {INFRA.map(item => {
                const c = COLOR_MAP[item.color];
                return (
                  <div key={item.title} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm p-6`}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">{item.section}</p>
                        <h4 className="text-slate-900 font-black text-lg">{item.title}</h4>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {item.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium leading-relaxed">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2.5 Core Web Vitals ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>2.5 — SEO và Core Web Vitals</SectionLabel>

          <p className="text-slate-600 text-base leading-relaxed mb-8 max-w-3xl">
            Để đánh giá hiệu quả của Hybrid Rendering, đề tài dựa trên bộ chỉ số <span className="text-slate-900 font-bold">Core Web Vitals</span> của Google — thước đo khách quan nhất về trải nghiệm người dùng thực tế.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {VITALS_SUMMARY.map(v => {
              const c = COLOR_MAP[v.color];
              return (
                <div key={v.name} className={`rounded-2xl border-2 ${c.border} bg-white shadow-sm p-5`}>
                  <div className={`w-12 h-12 rounded-xl ${c.num} flex items-center justify-center font-black font-mono text-sm mb-3`}>
                    {v.name}
                  </div>
                  <h4 className="text-slate-900 font-black text-sm mb-1">{v.full}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3 font-medium">{v.desc}</p>
                  <span className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono ${c.badge} px-2 py-0.5 rounded border border-opacity-50`}>
                    Tối ưu: {v.target}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest mb-3">Hybrid Rendering cải thiện Core Web Vitals như thế nào?</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { metric: 'LCP', ssg: '~0.8s ✓', csr: '~4.5s ✗', reason: 'SSG/ISR có HTML + image URL sẵn → browser preload ngay. CSR phải chờ JS → fetch → render.' },
                { metric: 'CLS', ssg: '~0.02 ✓', csr: '~0.18 ✗', reason: 'SSG/ISR biết dimensions trước → reserve space. CSR skeleton swap gây layout shift.' },
                { metric: 'TBT', ssg: '~40ms ✓', csr: '~380ms ✗', reason: 'CSR bundle lớn hơn (inline toàn bộ components) → main thread bị block lâu hơn.' },
                { metric: 'TTFB', ssg: '~15ms ✓', ssr: '~350ms', reason: 'SSG serve file tĩnh từ disk. SSR phải fetch DB + render. CSR HTML rỗng nhanh nhưng FCP chậm.' },
              ].map(row => (
                <div key={row.metric} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{row.metric}</span>
                    {row.ssg && <span className="text-[9px] font-black font-mono text-emerald-600">SSG {row.ssg}</span>}
                    {row.csr && <span className="text-[9px] font-black font-mono text-rose-600">CSR {row.csr}</span>}
                    {row.ssr && <span className="text-[9px] font-black font-mono text-amber-600">SSR {row.ssr}</span>}
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{row.reason}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-4 font-bold">
              Xem chi tiết tại: <Link href="/docs/vitals" className="text-emerald-600 hover:underline">/docs/vitals</Link> · Đo lường thực tế tại: <Link href="/seminar/experiment" className="text-emerald-600 hover:underline">/seminar/experiment</Link>
            </p>
          </div>
        </div>

        {/* ── Next chapter CTA ── */}
        <div className="border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <p className="text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest mb-2">Tiếp theo</p>
                <p className="text-slate-900 font-black text-xl">Chương 3: Thực nghiệm</p>
                <p className="text-slate-500 text-sm mt-1">Xây dựng ứng dụng thực tế, đo lường và so sánh hiệu năng 4 rendering mode trên môi trường Cloud</p>
              </div>
              <Link href="/seminar/experiment" className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-sm">
                Thực nghiệm →
              </Link>
            </div>
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