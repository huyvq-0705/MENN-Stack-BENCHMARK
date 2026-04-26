import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  // Hàm kiểm tra xem link có đang active không để tô màu
  const isActive = (path) => router.pathname.includes(path);

  const navLinks = [
    { name: 'SSG', path: '/ssg/homepage', desc: 'Static' },
    { name: 'SSR', path: '/ssr/homepage', desc: 'Server' },
    { name: 'ISR', path: '/isr/homepage', desc: 'Hybrid' },
    { name: 'CSR', path: '/csr/homepage', desc: 'Client' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 backdrop-blur-md bg-opacity-90">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-900 group-hover:rotate-12 transition-transform">
            SG
          </div>
          <span className="text-white font-bold tracking-tighter text-xl">Sài Gòn Blog</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-1 md:gap-4">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path}>
              <div className={`px-3 py-2 rounded-md transition-all duration-200 flex flex-col items-center border-b-2 ${
                isActive(link.path) 
                ? 'border-emerald-500 bg-slate-800' 
                : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}>
                <span className={`text-xs font-black tracking-widest ${isActive(link.path) ? 'text-emerald-400' : ''}`}>
                  {link.name}
                </span>
                <span className="text-[10px] opacity-50 uppercase hidden md:block">
                  {link.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Documentation Link / CTA */}
        <div className="hidden lg:block">
          <a 
            href="https://nextjs.org/docs" 
            target="_blank" 
            className="text-[10px] font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded hover:border-emerald-500 hover:text-emerald-400 transition-colors"
          >
            DOCS v14.2
          </a>
        </div>
      </div>
    </nav>
  );
}