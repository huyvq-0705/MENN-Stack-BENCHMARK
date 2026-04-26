import Link from 'next/link';

export default function MegaFooter({ tags }) {
  // Cập nhật danh sách với đường dẫn (path) tương ứng với các file đã tạo
  const reportDocs = [
    { 
      title: "Kiến trúc Hybrid", 
      desc: "Sự kết hợp giữa SSR, SSG và ISR.",
      path: "/docs/hybrid" 
    },
    { 
      title: "MENN Stack Flow", 
      desc: "Luồng dữ liệu giữa Next.js và Express.",
      path: "/docs/menn-flow" 
    },
    { 
      title: "Core Web Vitals", 
      desc: "Tối ưu LCP, FID và CLS dưới 2.5s.",
      path: "/docs/vitals" 
    },
    { 
      title: "Cloud Deployment", 
      desc: "Triển khai Docker trên VPS DigitalOcean.",
      path: "/docs/cloud" 
    },
    { 
      title: "SEO Optimization", 
      desc: "Cải thiện chỉ số lập chỉ mục của Search Bot.",
      path: "/docs/seo" 
    }
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-8 border-emerald-500 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-700 pb-12">
          
          {/* Cột 1: Thông tin Đồ án */}
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

          {/* Cột 2: Kiến thức Đồ án (Đã có Link Clickable) */}
          <div className="col-span-1">
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-[0.2em] border-b border-emerald-500/30 pb-2 italic">
              Nội dung báo cáo
            </h4>
            <ul className="space-y-4">
              {reportDocs.map((item, idx) => (
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

          {/* Cột 3: Tag Cloud (SEO Keywords) */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-[0.2em] border-b border-emerald-500/30 pb-2 italic">
              Key Concepts (Benchmark)
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag, idx) => (
                <span key={idx} className="bg-slate-800/50 border border-slate-700 text-[10px] px-3 py-1.5 rounded hover:border-emerald-500 hover:bg-emerald-500 hover:text-slate-900 transition-all cursor-default font-mono uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] opacity-50 font-mono">
          <div className="flex gap-4">
            <span>© 2026 UIT SEMINAR</span>
            <span className="text-emerald-500 animate-pulse">●</span>
            <span>NEXT.JS v14.2 STABLE</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
            <Link href="/docs/hybrid" className="hover:text-emerald-400 transition-colors uppercase">Giới thiệu</Link>
            <Link href="/docs/menn-flow" className="hover:text-emerald-400 transition-colors uppercase">Lý thuyết</Link>
            <Link href="/docs/vitals" className="hover:text-emerald-400 transition-colors uppercase">Thực nghiệm</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}