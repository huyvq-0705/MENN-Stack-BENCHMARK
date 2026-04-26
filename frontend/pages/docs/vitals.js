import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

export default function VitalsDoc() {
  const vitals = [
    { name: "LCP", full: "Largest Contentful Paint", target: "< 2.5s", status: "EXCELLENT", color: "bg-emerald-500" },
    { name: "FID", full: "First Input Delay", target: "< 100ms", status: "FAST", color: "bg-emerald-400" },
    { name: "CLS", full: "Cumulative Layout Shift", target: "< 0.1", status: "STABLE", color: "bg-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Head><title>Core Web Vitals | Docs</title></Head>
      <Navbar />
      <main className="max-w-4xl mx-auto py-20 px-6 flex-grow">
        <h1 className="text-4xl font-black mb-10 tracking-tight">CHỈ SỐ SỐNG CÒN (VITALS)</h1>
        <div className="space-y-6">
          {vitals.map(v => (
            <div key={v.name} className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className={`${v.color} text-slate-900 p-8 flex flex-col items-center justify-center md:w-48`}>
                <span className="text-4xl font-black">{v.name}</span>
                <span className="text-[10px] font-bold opacity-80 uppercase">{v.status}</span>
              </div>
              <div className="p-8 flex-grow">
                <h3 className="text-lg font-bold mb-1">{v.full}</h3>
                <p className="text-sm text-slate-500 mb-4 tracking-tighter">Mục tiêu kỹ thuật: <span className="font-mono font-bold text-slate-800">{v.target}</span></p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${v.color} h-full`} style={{width: '95%'}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <MegaFooter tags={["LCP", "FID", "CLS", "Performance"]} />
    </div>
  );
}

export async function getStaticProps() { return { props: {} }; }