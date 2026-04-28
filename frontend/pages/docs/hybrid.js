import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODES = [
  {
    id: 'SSG',
    num: '01',
    color: 'emerald',
    title: 'Static Site Generation',
    tagline: '"Phở Gói" — Đã chuẩn bị sẵn',
    icon: '📦',
    when: 'Build time',
    dataFresh: 'Cố định đến lần build tiếp theo',
    ttfb: '~10–50ms',
    serverLoad: 'Zero',
    seoScore: '100/100',
    hook: 'getStaticProps()',
    analogy: 'Đã gói sẵn trong bao bì. Khách đến chỉ việc xé ra dùng ngay — không cần nấu, không cần chờ. Nhanh tuyệt đối nhưng nếu recipe thay đổi, cần đóng gói lại toàn bộ.',
    how: 'Next.js chạy getStaticProps() một lần duy nhất lúc build. Kết quả được render thành file HTML tĩnh và lưu vào disk. Mọi request sau đó đều nhận cùng file HTML đó — từ CDN cache, không cần server compute.',
    bestFor: ['Trang Landing / Homepage marketing', 'Tài liệu kỹ thuật (docs)', 'Blog posts ít thay đổi', 'Bất kỳ trang nào data không đổi theo giờ'],
    tradeoff: 'Data có thể stale cho đến lần deploy tiếp theo. Nếu có 1000 posts, build time tăng tuyến tính.',
    code: `// pages/ssg/homepage.js
export async function getStaticProps() {
  const posts = await fetch(BACKEND + '/api/posts');
  return {
    props: { posts },
    // Không có revalidate → thuần SSG
  };
}`,
  },
  {
    id: 'SSR',
    num: '02',
    color: 'rose',
    title: 'Server-Side Rendering',
    tagline: '"Phở Vỉa Hè" — Nấu khi có khách',
    icon: '🍜',
    when: 'Mỗi request',
    dataFresh: 'Luôn mới nhất',
    ttfb: '~200–800ms',
    serverLoad: 'Cao',
    seoScore: '100/100',
    hook: 'getServerSideProps()',
    analogy: 'Khách gọi mới bắt đầu trụng bánh, thái thịt. Tô phở nóng hổi nhất — data mới nhất từ database — nhưng khách phải đứng đợi. Server bận liên tục.',
    how: 'Next.js chạy getServerSideProps() trên server cho mỗi HTTP request. Server fetch data từ Express backend, render HTML hoàn chỉnh, rồi gửi về browser. Không có cache giữa các request trừ khi tự cấu hình.',
    bestFor: ['Trang cần user-specific data (dashboard, profile)', 'Kết quả search realtime', 'Trang cần data cực kỳ fresh (giá cổ phiếu, tin tức breaking)', 'A/B testing dựa trên cookies'],
    tradeoff: 'TTFB cao hơn SSG vì server phải fetch + render trước khi response. Server bị tải cao khi traffic lớn.',
    code: `// pages/ssr/homepage.js
export async function getServerSideProps(context) {
  const start = Date.now();
  const posts = await fetch(BACKEND + '/api/posts');
  return {
    props: {
      posts,
      serverRenderMs: Date.now() - start,
    },
  };
}`,
  },
  {
    id: 'ISR',
    num: '03',
    color: 'blue',
    title: 'Incremental Static Regeneration',
    tagline: '"Cơm Tấm Đang Nướng" — Best of both',
    icon: '🍖',
    when: 'Build time + background revalidate',
    dataFresh: 'Tối đa N giây cũ (configurable)',
    ttfb: '~10–50ms',
    serverLoad: 'Rất thấp',
    seoScore: '100/100',
    hook: 'getStaticProps() + revalidate',
    analogy: 'Cơm đã nấu sẵn từ sáng. Thịt được nướng liên tục suốt ngày — background revalidation. Khách luôn được phục vụ ngay, và thịt lúc nào cũng còn ấm nóng.',
    how: 'Lần đầu tiên request đến một trang ISR: Next.js serve file HTML đã build sẵn (nhanh như SSG). Đồng thời, nếu đã quá thời gian revalidate, Next.js kích hoạt background regeneration — build lại HTML mới mà không block user. Request tiếp theo nhận file mới.',
    bestFor: ['Blog posts (revalidate: 60s)', 'Trang danh sách sản phẩm', 'Homepage với data thay đổi vài phút một lần', 'Bất kỳ trang nào chấp nhận data cũ vài giây'],
    tradeoff: 'User đầu tiên sau khi revalidate window hết hạn vẫn nhận HTML cũ — next user mới thấy mới. Cần webhook để force revalidate ngay khi data thay đổi.',
    code: `// pages/isr/homepage.js
export async function getStaticProps() {
  const posts = await fetch(BACKEND + '/api/posts');
  return {
    props: { posts },
    revalidate: 60, // Regenerate sau mỗi 60 giây
  };
}`,
  },
  {
    id: 'CSR',
    num: '04',
    color: 'amber',
    title: 'Client-Side Rendering',
    tagline: '"Tự Nấu Ăn" — Browser làm tất cả',
    icon: '🛒',
    when: 'Sau khi JS bundle load xong',
    dataFresh: 'Realtime (fetch mỗi lần mount)',
    ttfb: '~10ms (HTML rỗng)',
    serverLoad: 'Zero',
    seoScore: '~40–60/100',
    hook: 'useEffect() + fetch()',
    analogy: 'Server giao cho bạn một cái bếp trống (HTML shell). Bạn phải tự mua nguyên liệu (fetch API), tự nấu (JavaScript render), rồi mới ăn được. Tốt cho dân pro, nhưng chậm hơn và Googlebot không ăn được.',
    how: 'Server trả về HTML rỗng với chỉ một thẻ <div id="__next">. Browser tải toàn bộ JS bundle, React khởi tạo, useEffect chạy, fetch API được gọi, state được update, cuối cùng DOM mới render. Googlebot thường bỏ qua vì không chạy JS.',
    bestFor: ['Admin dashboard (không cần SEO)', 'Ứng dụng cần user interaction phức tạp', 'Real-time data (chat, live feed)', 'Các trang sau login gate'],
    tradeoff: 'FCP và LCP cao nhất trong 4 phương pháp. SEO gần như bằng 0 cho public pages. Bundle JS phải load hoàn toàn trước khi user thấy bất kỳ thứ gì.',
    code: `// pages/csr/homepage.js
// Không có getStaticProps hay getServerSideProps
export default function CSRPage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch('/api/blog-proxy')  // Qua Next.js proxy
      .then(r => r.json())
      .then(setPosts);
  }, []);
  return <BlogGrid posts={posts} />;
}`,
  },
];

const COMPARISON = [
  { metric: 'TTFB',          ssg: '~10ms ✓✓', ssr: '~400ms ✗',  isr: '~10ms ✓✓', csr: '~10ms*'  },
  { metric: 'Data Freshness', ssg: 'Stale',     ssr: 'Realtime',  isr: 'N giây',   csr: 'Realtime' },
  { metric: 'SEO',           ssg: '✓✓ Full',   ssr: '✓✓ Full',   isr: '✓✓ Full',  csr: '✗ Kém'   },
  { metric: 'Server Load',   ssg: 'Zero',       ssr: 'Cao',       isr: 'Rất thấp', csr: 'Zero'    },
  { metric: 'Build Time',    ssg: 'Lâu hơn',    ssr: 'Nhanh',     isr: 'Nhanh',    csr: 'Nhanh'   },
  { metric: 'Caching',       ssg: 'CDN tự do',  ssr: 'Khó cache', isr: 'CDN + ISR', csr: 'Browser' },
];

const COLOR_MAP = {
  emerald: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500', num: 'bg-emerald-500/20 text-emerald-300', light: 'text-emerald-600' },
  rose:    { border: 'border-rose-500',    text: 'text-rose-400',    bg: 'bg-rose-500/10',    badge: 'bg-rose-500/20 text-rose-300',    dot: 'bg-rose-500',    num: 'bg-rose-500/20 text-rose-300',    light: 'text-rose-600'    },
  blue:    { border: 'border-blue-500',    text: 'text-blue-400',    bg: 'bg-blue-500/10',    badge: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-500',    num: 'bg-blue-500/20 text-blue-300',    light: 'text-blue-600'    },
  amber:   { border: 'border-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   badge: 'bg-amber-500/20 text-amber-300',  dot: 'bg-amber-500',   num: 'bg-amber-500/20 text-amber-300',  light: 'text-amber-600'   },
};

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

function ModeCard({ mode }) {
  const c = COLOR_MAP[mode.color];
  return (
    <div className={`rounded-2xl border ${c.border} border-opacity-30 bg-slate-800/50 overflow-hidden`}>

      {/* Header */}
      <div className={`border-b ${c.border} border-opacity-20 p-6`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${c.num} flex items-center justify-center font-black font-mono text-sm flex-shrink-0`}>
              {mode.num}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{mode.icon}</span>
                <span className={`text-[9px] font-black tracking-[0.25em] uppercase font-mono ${c.badge} px-2 py-0.5 rounded`}>{mode.id}</span>
              </div>
              <h3 className="text-white font-black text-xl leading-none">{mode.title}</h3>
              <p className={`text-xs font-mono mt-1 ${c.text}`}>{mode.tagline}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { k: 'TTFB',       v: mode.ttfb       },
              { k: 'Data',       v: mode.dataFresh   },
              { k: 'SEO',        v: mode.seoScore    },
              { k: 'Server',     v: mode.serverLoad  },
            ].map(s => (
              <div key={s.k} className="bg-slate-900/60 rounded-lg px-3 py-2 text-center min-w-[72px]">
                <p className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">{s.k}</p>
                <p className="text-[11px] text-white font-black font-mono mt-0.5 leading-tight">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid md:grid-cols-3 gap-6">

        {/* Analogy */}
        <div className={`${c.bg} rounded-xl p-4`}>
          <p className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono mb-2 ${c.text}`}>Ví von thực tế</p>
          <p className="text-sm text-slate-300 leading-relaxed italic">{mode.analogy}</p>
        </div>

        {/* How it works */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">Cơ chế hoạt động</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{mode.how}</p>
          <div className={`inline-flex items-center gap-2 ${c.badge} px-3 py-1.5 rounded-lg`}>
            <span className="text-[8px] font-mono uppercase tracking-widest">Hook</span>
            <code className="text-[11px] font-black">{mode.hook}</code>
          </div>
        </div>

        {/* Best for + tradeoff */}
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">Dùng khi nào?</p>
          <ul className="space-y-1.5 mb-4">
            {mode.bestFor.map(b => (
              <li key={b} className="flex items-start gap-2 text-xs text-slate-300">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1 flex-shrink-0`} />
                {b}
              </li>
            ))}
          </ul>
          <div className="bg-slate-900/50 rounded-lg p-3 border-l-2 border-slate-600">
            <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest mb-1">Đánh đổi</p>
            <p className="text-xs text-slate-400 leading-relaxed">{mode.tradeoff}</p>
          </div>
        </div>
      </div>

      {/* Code snippet */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <pre className="px-6 py-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
          <code>{mode.code}</code>
        </pre>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HybridDoc({ buildTime }) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
      <Head>
        <title>Kiến trúc Hybrid | Seminar Docs</title>
        <meta name="description" content="So sánh chi tiết SSG, SSR, ISR và CSR trong dự án MENN Stack Seminar" />
      </Head>
      <Navbar />

      <main className="flex-grow">

        {/* ── Hero ── */}
        <div className="border-b border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <p className="text-[9px] font-black tracking-[0.35em] uppercase text-emerald-500 font-mono mb-4">
              Seminar Docs / Hybrid Architecture
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter mb-6">
              HYBRID<br />
              <span className="text-emerald-400">RENDERING</span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-12">
              Lấy cảm hứng từ sự linh hoạt của giao thông Sài Gòn: lúc nhanh như cao tốc (SSG), lúc thích ứng như hẻm nhỏ (SSR), lúc khéo léo kết hợp cả hai (ISR). Không có phương pháp nào tốt nhất — chỉ có phương pháp phù hợp nhất với từng tình huống.
            </p>

            {/* The core idea */}
            <div className="grid md:grid-cols-4 gap-4">
              {MODES.map(mode => {
                const c = COLOR_MAP[mode.color];
                return (
                  <div key={mode.id} className={`bg-slate-800/50 border ${c.border} border-opacity-30 rounded-xl p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span>{mode.icon}</span>
                      <span className={`text-[9px] font-black tracking-[0.2em] uppercase font-mono ${c.text}`}>{mode.id}</span>
                    </div>
                    <p className="text-white font-bold text-sm leading-tight mb-1">{mode.title}</p>
                    <p className="text-slate-500 text-[10px]">{mode.tagline.split(' — ')[1]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Comparison table ── */}
        <div className="border-b border-slate-800 bg-slate-900/50">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <SectionLabel>So sánh trực tiếp — 4 phương pháp</SectionLabel>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-700 w-32">Metric</th>
                    {MODES.map(m => {
                      const c = COLOR_MAP[m.color];
                      return (
                        <th key={m.id} className={`px-4 py-3 text-center border-b border-slate-700 ${c.text} text-[10px] font-black tracking-[0.2em]`}>
                          {m.id}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.metric} className={i % 2 === 0 ? 'bg-slate-800/20' : ''}>
                      <td className="px-4 py-3 text-slate-500 uppercase tracking-wider text-[9px] border-r border-slate-800">{row.metric}</td>
                      {[row.ssg, row.ssr, row.isr, row.csr].map((val, j) => (
                        <td key={j} className="px-4 py-3 text-center text-slate-300 font-bold text-[10px]">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-slate-600 font-mono mt-3">* CSR TTFB thấp vì HTML rỗng — nhưng FCP và LCP rất cao do phải chờ JS render.</p>
          </div>
        </div>

        {/* ── Mode cards ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>Chi tiết từng phương pháp</SectionLabel>
          <div className="flex flex-col gap-8">
            {MODES.map(mode => <ModeCard key={mode.id} mode={mode} />)}
          </div>
        </div>

        {/* ── ISR Revalidation flow ── */}
        <div className="border-t border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>ISR Revalidation Flow — Cụ thể trong dự án</SectionLabel>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 border border-blue-500/30 rounded-2xl p-6">
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-blue-400 font-mono mb-4">On-demand Revalidation</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Khi admin tạo hoặc cập nhật bài viết qua dashboard, Express backend tự động gọi đến Next.js <code className="text-blue-300 bg-slate-900 px-1 rounded">/api/revalidate</code> endpoint với shared secret token. Next.js lập tức rebuild HTML cho trang ISR đó — không cần chờ revalidate interval.
                </p>
                <div className="space-y-2 font-mono text-[10px]">
                  {[
                    { arrow: '1.', text: 'Admin POST /api/posts (qua proxy)', color: 'text-slate-400' },
                    { arrow: '2.', text: 'Express save to MongoDB', color: 'text-slate-400' },
                    { arrow: '3.', text: 'Express → GET NEXTJS_URL/api/revalidate?path=/isr/homepage&secret=TOKEN', color: 'text-blue-300' },
                    { arrow: '4.', text: 'Next.js regenerate /isr/homepage HTML', color: 'text-emerald-300' },
                    { arrow: '5.', text: 'Next request nhận HTML mới ngay lập tức', color: 'text-emerald-400' },
                  ].map(step => (
                    <div key={step.arrow} className="flex gap-3">
                      <span className="text-slate-600 flex-shrink-0">{step.arrow}</span>
                      <span className={step.color}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-slate-400 font-mono mb-4">SSG được bảo vệ khỏi revalidation</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Trang SSG được cố ý giữ "hóa thạch" để minh họa sự khác biệt. Revalidate endpoint chặn mọi request rebuild cho <code className="text-slate-300 bg-slate-900 px-1 rounded">/ssg/homepage</code>.
                </p>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs">
                  <span className="text-slate-500">// pages/api/revalidate.js</span><br />
                  <span className="text-amber-300">if (path === '/ssg/homepage') {'{'}</span><br />
                  <span className="text-slate-400">{'  '}return res.json({'{'}</span><br />
                  <span className="text-slate-400">{'    '}revalidated: <span className="text-rose-400">false</span>,</span><br />
                  <span className="text-slate-400">{'    '}message: <span className="text-emerald-300">'SSG thuần, không cập nhật'</span></span><br />
                  <span className="text-slate-400">{'  '}{'}'});</span><br />
                  <span className="text-amber-300">{'}'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Decision guide ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>Khi nào dùng gì? — Decision Tree</SectionLabel>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
            <div className="space-y-6 font-mono text-sm">
              {[
                { q: 'Trang cần SEO không?',                  no: '→ CSR (admin dashboard, user pages)',    yes: null   },
                { q: 'Data thay đổi theo từng user/request?', no: null,                                     yes: '→ SSR (profile, personalised feed)' },
                { q: 'Data thay đổi định kỳ (phút/giờ)?',    no: '→ SSG (landing page, docs tĩnh)',        yes: '→ ISR (blog, product list)'          },
                { q: 'Data hầu như không bao giờ đổi?',       no: null,                                     yes: '→ SSG + manual redeploy khi cần'     },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-slate-600 flex-shrink-0 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold mb-2">{item.q}</p>
                    <div className="flex flex-wrap gap-4">
                      {item.no  && <span className="text-rose-400 text-xs">Không: {item.no}</span>}
                      {item.yes && <span className="text-emerald-400 text-xs">Có: {item.yes}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 text-[10px] text-slate-500 font-mono">
              Built at: {buildTime} · Trang này dùng SSG (getStaticProps, không có revalidate)
            </div>
          </div>
        </div>

      </main>

      <MegaFooter tags={['Hybrid', 'SSG', 'SSR', 'ISR', 'CSR', 'Next.js', 'getStaticProps', 'getServerSideProps', 'revalidate', 'Web Vitals']} />
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      buildTime: new Date().toISOString(),
    },
  };
}