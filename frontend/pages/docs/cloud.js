import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK = [
  {
    color: 'emerald',
    badge: 'Infrastructure',
    title: 'DigitalOcean VPS',
    subtitle: 'Droplet — Singapore SG1',
    icon: '🌊',
    spec: [
      { k: 'Region',  v: 'SGP1 — Singapore' },
      { k: 'OS',      v: 'Ubuntu 24.04 LTS' },
      { k: 'vCPU',    v: '2 cores' },
      { k: 'RAM',     v: '2 GB' },
      { k: 'Storage', v: '50 GB SSD' },
    ],
    body: 'DigitalOcean Droplet đặt tại Singapore giúp giảm độ trễ về Việt Nam xuống dưới 30ms. So với server đặt ở US (~200ms) hay EU (~180ms), đây là lựa chọn tối ưu cho người dùng Đông Nam Á.',
    why: 'Latency từ HCM City đến SGP1 ≈ 8–15ms. Toàn bộ backend, frontend và database đều chạy trên cùng một Droplet, loại bỏ chi phí cross-region network.',
  },
  {
    color: 'blue',
    badge: 'Containerization',
    title: 'Docker',
    subtitle: 'Build once, run anywhere',
    icon: '🐳',
    spec: [
      { k: 'Engine',  v: 'Docker 26.x' },
      { k: 'Network', v: 'coolify — bridge' },
      { k: 'Backend', v: 'Nixpacks image' },
      { k: 'Frontend', v: 'Nixpacks image' },
      { k: 'Isolation', v: 'Per-service containers' },
    ],
    body: 'Mỗi service (Next.js frontend, Express backend) được đóng gói vào một Docker container riêng. Container share cùng Docker network "coolify" để communicate nội bộ mà không cần expose port ra internet.',
    why: 'Không còn "works on my machine" — container trên máy dev sẽ chạy y hệt trên VPS. Rollback dễ dàng bằng cách pull image cũ. Scaling bằng cách tăng replica.',
  },
  {
    color: 'violet',
    badge: 'PaaS / CI-CD',
    title: 'Coolify',
    subtitle: 'Self-hosted Heroku alternative',
    icon: '🚀',
    spec: [
      { k: 'Version',   v: 'v4.0 beta' },
      { k: 'Build',     v: 'Nixpacks (auto-detect)' },
      { k: 'Proxy',     v: 'Traefik v2' },
      { k: 'SSL',       v: "Let's Encrypt auto" },
      { k: 'Deploy',    v: 'Git push → auto build' },
    ],
    body: 'Coolify là một PaaS tự host trên VPS của chính mình — không phụ thuộc vào Vercel hay Heroku. Kết nối GitHub repo, mỗi lần push code là Coolify tự động build Docker image và deploy lên server.',
    why: 'Traefik (reverse proxy tích hợp sẵn) tự động cấp SSL từ Let\'s Encrypt và route traffic đến đúng container. Zero-downtime deploy nhờ health check trước khi switch traffic.',
  },
  {
    color: 'amber',
    badge: 'Database',
    title: 'MongoDB (Coolify)',
    subtitle: 'Self-hosted on VPS — same Droplet',
    icon: '🍃',
    spec: [
      { k: 'Type',      v: 'NoSQL Document DB' },
      { k: 'Host',      v: 'Coolify managed container' },
      { k: 'Network',   v: 'Internal Docker bridge' },
      { k: 'ODM',       v: 'Mongoose v8' },
      { k: 'Latency',   v: '< 1ms (same host)' },
    ],
    body: 'MongoDB chạy như một container được Coolify quản lý trực tiếp trên cùng Droplet với backend. Coolify cung cấp giao diện để tạo database, set credentials, và tự động inject connection string vào backend container qua environment variable.',
    why: 'Vì cùng Docker network, backend Express kết nối đến MongoDB qua internal hostname — không qua internet, không tốn băng thông, latency dưới 1ms. Không phụ thuộc Atlas hay dịch vụ bên ngoài. Toàn bộ stack nằm trên một VPS duy nhất.',
  },
  {
    color: 'rose',
    badge: 'CDN / Storage',
    title: 'DigitalOcean Spaces',
    subtitle: 'S3-compatible Object Storage',
    icon: '🗂️',
    spec: [
      { k: 'Protocol',  v: 'S3-compatible API' },
      { k: 'Region',    v: 'SGP1 — Singapore' },
      { k: 'CDN',       v: 'Enabled (edge cache)' },
      { k: 'SDK',       v: '@aws-sdk/client-s3' },
      { k: 'ACL',       v: 'public-read per object' },
    ],
    body: 'Cover images của bài viết được upload lên DigitalOcean Spaces thay vì lưu trực tiếp trên VPS. File được serve qua CDN edge nodes toàn cầu — user ở Hà Nội tải ảnh từ node gần nhất thay vì VPS Singapore.',
    why: 'Dùng AWS SDK (@aws-sdk/client-s3) vì Spaces tương thích 100% S3 API. Upload flow: Browser → Next.js proxy API → Express → Spaces. Giấu S3 credentials hoàn toàn, không expose ra client.',
  },
];

const FLOW_STEPS = [
  { step: '01', title: 'Git Push', desc: 'Developer push code lên GitHub repo (main branch)', color: 'emerald' },
  { step: '02', title: 'Webhook Trigger', desc: 'GitHub gửi webhook đến Coolify trên VPS', color: 'blue' },
  { step: '03', title: 'Nixpacks Build', desc: 'Coolify chạy Nixpacks để detect và build Docker image từ source code', color: 'violet' },
  { step: '04', title: 'Health Check', desc: 'Container mới khởi động, Coolify kiểm tra /health endpoint', color: 'amber' },
  { step: '05', title: 'Traffic Switch', desc: 'Traefik chuyển toàn bộ traffic sang container mới. Container cũ bị stop.', color: 'emerald' },
  { step: '06', title: 'SSL Auto-renew', desc: "Let's Encrypt tự gia hạn cert 30 ngày trước khi expire", color: 'rose' },
];

const NETWORK_DIAGRAM = [
  { label: 'Internet', sub: 'User browser', right: '→', color: 'slate' },
  { label: 'Traefik', sub: 'Reverse Proxy + SSL', right: '→', color: 'blue' },
  { label: 'Next.js', sub: 'Frontend :3000', right: '→', color: 'emerald' },
  { label: 'Express', sub: 'Backend :5123', right: '→', color: 'rose' },
  { label: 'MongoDB', sub: 'Database :27017 (internal)', right: null, color: 'amber' },
];

const COLOR_MAP = {
  emerald: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500' },
  blue:    { border: 'border-blue-500',    text: 'text-blue-400',    bg: 'bg-blue-500/10',    badge: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-500'    },
  violet:  { border: 'border-violet-500',  text: 'text-violet-400',  bg: 'bg-violet-500/10',  badge: 'bg-violet-500/20 text-violet-300',  dot: 'bg-violet-500'  },
  amber:   { border: 'border-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   badge: 'bg-amber-500/20 text-amber-300',   dot: 'bg-amber-500'   },
  rose:    { border: 'border-rose-500',    text: 'text-rose-400',    bg: 'bg-rose-500/10',    badge: 'bg-rose-500/20 text-rose-300',    dot: 'bg-rose-500'    },
  slate:   { border: 'border-slate-500',   text: 'text-slate-400',   bg: 'bg-slate-500/10',   badge: 'bg-slate-500/20 text-slate-300',   dot: 'bg-slate-500'   },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="h-px flex-1 bg-slate-700" />
      <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-500 font-mono">{children}</span>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

function StackCard({ item }) {
  const c = COLOR_MAP[item.color];
  return (
    <div className={`rounded-2xl border ${c.border} border-opacity-30 bg-slate-800/50 overflow-hidden`}>
      {/* Header */}
      <div className={`border-b ${c.border} border-opacity-20 p-6 flex items-start justify-between`}>
        <div>
          <span className={`text-[9px] font-black tracking-[0.25em] uppercase font-mono ${c.badge} px-2 py-0.5 rounded mb-3 inline-block`}>
            {item.badge}
          </span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h3 className="text-white font-black text-xl leading-none">{item.title}</h3>
              <p className={`text-xs font-mono mt-0.5 ${c.text}`}>{item.subtitle}</p>
            </div>
          </div>
        </div>
        {/* Spec table */}
        <div className="hidden md:block text-right">
          {item.spec.map(s => (
            <div key={s.k} className="flex items-center gap-3 justify-end mb-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{s.k}</span>
              <span className="text-[10px] text-slate-300 font-mono font-bold">{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-500 mb-2 font-mono">Cách hoạt động</p>
          <p className="text-sm text-slate-300 leading-relaxed">{item.body}</p>
        </div>
        <div className={`${c.bg} rounded-xl p-4`}>
          <p className={`text-[9px] font-black tracking-[0.2em] uppercase mb-2 font-mono ${c.text}`}>Tại sao chọn?</p>
          <p className="text-sm text-slate-300 leading-relaxed">{item.why}</p>
        </div>
      </div>

      {/* Mobile spec */}
      <div className="md:hidden px-6 pb-6 flex flex-wrap gap-3">
        {item.spec.map(s => (
          <div key={s.k} className="bg-slate-900/50 rounded px-3 py-1.5">
            <span className="text-[8px] text-slate-500 font-mono uppercase block">{s.k}</span>
            <span className="text-[10px] text-slate-300 font-mono font-bold">{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CloudDoc() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
      <Head>
        <title>Cloud Deployment | Seminar Docs</title>
        <meta name="description" content="Kiến trúc triển khai: DigitalOcean VPS, Docker, Coolify, MongoDB Atlas, Spaces CDN" />
      </Head>
      <Navbar />

      <main className="flex-grow">

        {/* ── Hero ── */}
        <div className="border-b border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div>
                <p className="text-[9px] font-black tracking-[0.35em] uppercase text-emerald-500 font-mono mb-4">
                  Seminar Docs / Cloud
                </p>
                <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter mb-4">
                  DEPLOYMENT<br />
                  <span className="text-emerald-400">STACK</span>
                </h1>
                <p className="text-slate-400 text-base max-w-lg leading-relaxed">
                  Toàn bộ hệ thống chạy trên một DigitalOcean Droplet tại Singapore, được orchestrate bởi Coolify và Docker. Zero third-party PaaS phí.
                </p>
              </div>

              {/* Live architecture mini-diagram */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 font-mono text-xs min-w-[200px]">
                <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-3">Network Flow</p>
                {NETWORK_DIAGRAM.map((node, i) => {
                  const c = COLOR_MAP[node.color];
                  return (
                    <div key={node.label} className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
                      <div>
                        <span className="text-white font-bold text-[10px]">{node.label}</span>
                        <span className="text-slate-500 text-[9px] ml-1">{node.sub}</span>
                      </div>
                      {node.right && <span className="text-slate-600 ml-auto">{node.right}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {[
                { label: 'Latency to VN', value: '< 15ms',    sub: 'SGP1 → HCM',           color: 'emerald' },
                { label: 'SSL',           value: 'Auto',       sub: "Let's Encrypt",         color: 'blue'    },
                { label: 'Deploy time',   value: '~90s',       sub: 'Git push to live',      color: 'violet'  },
                { label: 'Containers',    value: '2',          sub: 'Frontend + Backend',    color: 'amber'   },
              ].map(stat => {
                const c = COLOR_MAP[stat.color];
                return (
                  <div key={stat.label} className={`bg-slate-800/50 border ${c.border} border-opacity-30 rounded-xl p-4`}>
                    <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${c.text} leading-none`}>{stat.value}</p>
                    <p className="text-[9px] text-slate-500 mt-1">{stat.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Stack cards ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>Tech Stack — Chi tiết từng thành phần</SectionLabel>
          <div className="flex flex-col gap-6">
            {STACK.map(item => <StackCard key={item.title} item={item} />)}
          </div>
        </div>

        {/* ── CI/CD Flow ── */}
        <div className="border-t border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>CI/CD Pipeline — Từ code đến production</SectionLabel>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-8 top-8 bottom-8 w-px bg-slate-700 hidden md:block" />

              <div className="flex flex-col gap-4">
                {FLOW_STEPS.map((step) => {
                  const c = COLOR_MAP[step.color];
                  return (
                    <div key={step.step} className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl ${c.bg} border ${c.border} border-opacity-40 flex items-center justify-center flex-shrink-0 relative z-10`}>
                        <span className={`text-lg font-black font-mono ${c.text}`}>{step.step}</span>
                      </div>
                      <div className="flex-1 pt-2">
                        <h4 className="text-white font-black text-base mb-1">{step.title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Internal networking explainer ── */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionLabel>Internal Networking — Frontend ↔ Backend</SectionLabel>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <p className="text-[9px] font-black tracking-[0.25em] uppercase text-rose-400 font-mono mb-3">❌ Cách sai (localhost)</p>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs mb-4">
                <span className="text-slate-500"># Frontend gọi backend bằng:</span><br />
                <span className="text-rose-400">http://localhost:5123/api/posts</span><br />
                <span className="text-slate-500 text-[10px]"># ❌ localhost trong container = chính nó, không phải backend container</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Khi frontend container gọi <code className="text-rose-400 bg-slate-900 px-1 rounded">localhost</code>, nó resolve đến chính container đó — không phải backend container. Request sẽ fail với <code className="text-rose-300">ECONNREFUSED</code>.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-6">
              <p className="text-[9px] font-black tracking-[0.25em] uppercase text-emerald-400 font-mono mb-3">✓ Cách đúng (Docker network alias)</p>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs mb-4">
                <span className="text-slate-500"># Env var trên frontend container:</span><br />
                <span className="text-emerald-400">INTERNAL_BACKEND_URL=http://seminar-backend:5123</span><br />
                <span className="text-slate-500 text-[10px]"># ✓ Docker DNS resolve "seminar-backend" → backend container IP</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cả hai container cùng join Docker network <code className="text-emerald-400 bg-slate-900 px-1 rounded">coolify</code>. Docker's internal DNS tự động resolve container alias <code className="text-emerald-400 bg-slate-900 px-1 rounded">seminar-backend</code> thành IP của backend container. Traffic không ra internet.
              </p>
            </div>
          </div>

          {/* Environment variables table */}
          <div className="mt-6 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-700">
              <p className="text-[9px] font-black tracking-[0.25em] uppercase text-slate-500 font-mono">Environment Variables — Coolify Config</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-6 py-3 text-[9px] text-slate-500 uppercase tracking-widest">Service</th>
                    <th className="text-left px-6 py-3 text-[9px] text-slate-500 uppercase tracking-widest">Variable</th>
                    <th className="text-left px-6 py-3 text-[9px] text-slate-500 uppercase tracking-widest">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { svc: 'Frontend', var: 'INTERNAL_BACKEND_URL',    val: 'http://seminar-backend:5123', color: 'emerald' },
                    { svc: 'Frontend', var: 'NEXTJS_REVALIDATE_TOKEN', val: '(shared secret)',              color: 'blue'    },
                    { svc: 'Backend',  var: 'NEXTJS_URL',              val: 'https://ie213saigonblog.online', color: 'rose'  },
                    { svc: 'Backend',  var: 'MONGODB_URI',             val: 'mongodb://user:pass@mongo:27017/db', color: 'amber'   },
                    { svc: 'Backend',  var: 'SPACES_ENDPOINT',         val: 'https://sgp1.digitaloceanspaces.com', color: 'violet' },
                  ].map((row, i) => {
                    const c = COLOR_MAP[row.color];
                    return (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3">
                          <span className={`text-[9px] font-black uppercase ${c.badge} px-2 py-0.5 rounded`}>{row.svc}</span>
                        </td>
                        <td className={`px-6 py-3 ${c.text} font-bold`}>{row.var}</td>
                        <td className="px-6 py-3 text-slate-400">{row.val}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Why not Vercel ── */}
        <div className="border-t border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <SectionLabel>Tại sao không dùng Vercel / Railway?</SectionLabel>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Chi phí',
                  color: 'amber',
                  points: [
                    'Vercel Pro: $20/tháng/người',
                    'Railway Starter: $5/tháng + usage',
                    'DigitalOcean Droplet 2GB: $18/tháng',
                    'Coolify + MongoDB: Free & self-hosted',
                    '→ Toàn bộ stack trên 1 Droplet duy nhất',
                  ],
                },
                {
                  title: 'Kiểm soát',
                  color: 'emerald',
                  points: [
                    'Vercel lock-in Next.js Edge Runtime',
                    'Không thể chạy custom TCP server',
                    'Coolify: full root access VPS',
                    'Tự cấu hình Traefik headers',
                    'Không bị giới hạn bởi platform rules',
                  ],
                },
                {
                  title: 'Học thuật',
                  color: 'blue',
                  points: [
                    'Hiểu rõ Docker networking từ đầu',
                    'Debug thực tế: container DNS, SSL, proxy',
                    'CI/CD pipeline từ GitHub → VPS',
                    'Không bị abstraction layer che khuất',
                    'Real DevOps experience',
                  ],
                },
              ].map(card => {
                const c = COLOR_MAP[card.color];
                return (
                  <div key={card.title} className={`bg-slate-800/50 border ${c.border} border-opacity-30 rounded-2xl p-6`}>
                    <h4 className={`font-black text-base mb-4 ${c.text}`}>{card.title}</h4>
                    <ul className="space-y-2">
                      {card.points.map((p, i) => (
                        <li key={i} className={`text-xs leading-relaxed flex items-start gap-2 ${p.startsWith('→') ? 'text-white font-bold mt-3' : 'text-slate-400'}`}>
                          {!p.startsWith('→') && <span className={`w-1 h-1 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />}
                          {p.replace('→ ', '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      <MegaFooter tags={['DigitalOcean', 'Docker', 'Coolify', 'VPS', 'Nixpacks', 'Traefik', 'MongoDB Atlas', 'Spaces CDN', 'CI/CD', 'SSL']} />
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}