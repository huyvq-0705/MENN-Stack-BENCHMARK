import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

export default function CloudDoc() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head><title>Cloud Deployment | Docs</title></Head>
      <Navbar />
      <main className="max-w-4xl mx-auto py-20 px-6 flex-grow">
        <div className="bg-slate-900 text-white p-12 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32"></div>
          <h1 className="text-4xl font-black mb-8 italic">DEPLOYMENT STACK</h1>
          
          <div className="grid grid-cols-1 gap-8 relative z-10">
            <div className="border-l-4 border-emerald-500 pl-6">
              <h3 className="text-emerald-400 font-mono text-xs mb-1">INFRASTRUCTURE</h3>
              <p className="font-bold text-xl mb-2 underline underline-offset-4">DigitalOcean VPS</p>
              <p className="text-sm text-slate-400">Máy chủ ảo tại Singapore, đảm bảo tốc độ về Việt Nam nhanh nhất.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-blue-400 font-mono text-xs mb-1">CONTAINERIZATION</h3>
              <p className="font-bold text-xl mb-2 underline underline-offset-4">Docker & Coolify</p>
              <p className="text-sm text-slate-400">Đóng gói ứng dụng để "chạy đâu cũng mượt", quản lý bằng giao diện Coolify tự động hóa CI/CD.</p>
            </div>
          </div>
        </div>
      </main>
      <MegaFooter tags={["DigitalOcean", "Docker", "Coolify", "VPS"]} />
    </div>
  );
}

export async function getStaticProps() { return { props: {} }; }