import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

export default function SeoDoc() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col text-slate-900">
      <Head><title>SEO Optimization | Docs</title></Head>
      <Navbar />
      <main className="max-w-4xl mx-auto py-20 px-6 flex-grow text-center">
        <div className="inline-block p-2 px-4 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black mb-6 tracking-[0.3em] uppercase">
          Search Engine Excellence
        </div>
        <h1 className="text-6xl font-black mb-12 tracking-tighter">BEYOND KEYWORDS</h1>
        
        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b-2 border-slate-900 pb-2">Technical SEO</h3>
            <p className="text-sm text-slate-600">Sử dụng <strong>Semantic HTML</strong> và <strong>JSON-LD Structured Data</strong> để nói chuyện trực tiếp với Google Bot.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b-2 border-slate-900 pb-2">Social Graph</h3>
            <p className="text-sm text-slate-600">Tối ưu <strong>Open Graph (OG)</strong> để link Blog luôn đẹp lung linh khi share lên Facebook/Zalo.</p>
          </div>
        </div>

        <div className="mt-20 p-8 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 italic text-slate-400">
          "SEO không chỉ là từ khóa, SEO là trải nghiệm người dùng tối ưu nhất."
        </div>
      </main>
      <MegaFooter tags={["SEO", "Semantic", "JSON-LD", "OpenGraph"]} />
    </div>
  );
}

export async function getStaticProps() { return { props: {} }; }