import Link from 'next/link';

const SEMINAR_NAV = [
  { label: 'Giới thiệu',  path: '/seminar/introduction', en: 'Introduction' },
  { label: 'Lý thuyết',   path: '/seminar/theory',       en: 'Theory'       },
  { label: 'Thực nghiệm', path: '/seminar/experiment',   en: 'Experiment'   },
  { label: 'Kết quả',     path: '/seminar/result',       en: 'Result'       },
];

const REPORT_DOCS = [
  { title: 'Kiến trúc Hybrid',  desc: 'Sự kết hợp giữa SSR, SSG và ISR.',            path: '/docs/hybrid'    },
  { title: 'MENN Stack Flow',   desc: 'Luồng dữ liệu giữa Next.js và Express.',       path: '/docs/menn-flow' },
  { title: 'Core Web Vitals',   desc: 'Tối ưu LCP, FID và CLS dưới 2.5s.',           path: '/docs/vitals'    },
  { title: 'Cloud Deployment',  desc: 'Triển khai Docker trên VPS DigitalOcean.',     path: '/docs/cloud'     },
  { title: 'SEO Optimization',  desc: 'Cải thiện chỉ số lập chỉ mục của Search Bot.', path: '/docs/seo'       },
];

export default function MegaFooter({ tags }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-8 border-emerald-500 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-700 pb-12">

          {/* Col 1: Brand */}
          <div className="col-span-1">
            <Link href="/ssg/homepage" className="inline-block group">
              <h3 className="text-2xl font-extrabold text-white mb-4 tracking-tight uppercase italic">
                Seminar <span className="text-emerald-500 group-hover:text-white transition-colors">2026</span>
              </h3>
            </Link>
            <p className="text-xs leading-relaxed mb-6 opacity-70">
              Nghiên cứu giải pháp Hybrid Rendering nhằm giải quyết bài toán hiệu năng và trải nghiệm người dùng trong kỷ nguyên số.
            </p>
            <div className="bg-slate-800 p-3 rounded border-l-4 border-emerald-500 shadow-inner">
              <p className="text-[10px] font-mono text-emerald-400">STATUS: OPTIMIZED</p>
              <p className="text-[10px] font-mono text-white">RENDER: HYBRID ENGINE</p>
            </div>
          </div>

          {/* Col 2: Docs */}
          <div className="col-span-1">
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-[0.2em] border-b border-emerald-500/30 pb-2 italic">
              Nội dung báo cáo
            </h4>
            <ul className="space-y-4">
              {REPORT_DOCS.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.path} className="group block">
                    <h5 className="text-emerald-400 text-xs font-bold group-hover:text-white group-hover:translate-x-1 transition-all duration-200 flex items-center gap-2">
                      <span className="text-[8px] opacity-0 group-hover:opacity-100">▶</span>
                      {item.title}
                    </h5>
                    <p className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity ml-4 md:ml-0 lg:ml-4">
                      {item.desc}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 & 4: Seminar chapters — replaces Key Concepts */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-[0.2em] border-b border-emerald-500/30 pb-2 italic">
              Báo cáo Seminar IE213
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {SEMINAR_NAV.map((item, idx) => (
                <Link key={idx} href={item.path} className="group block bg-slate-800/50 border border-slate-700 hover:border-emerald-500 rounded-xl p-4 transition-all duration-200 hover:bg-slate-800">
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                    Chương {idx + 1}
                  </p>
                  <p className="text-white font-black text-sm group-hover:text-emerald-400 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[9px] text-slate-600 font-mono mt-1">{item.en}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] opacity-50 font-mono">
          <div className="flex gap-4">
            <span>© 2026 UIT SEMINAR</span>
            <span className="text-emerald-500 animate-pulse">●</span>
            <span>NEXT.JS v14.2 STABLE</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
            {SEMINAR_NAV.map(item => (
              <Link key={item.path} href={item.path} className="hover:text-emerald-400 transition-colors uppercase">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}