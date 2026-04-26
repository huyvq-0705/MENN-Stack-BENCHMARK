import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

export default function MennFlow() {
  const steps = [
    { title: "MongoDB", role: "Kho lưu trữ", desc: "Nơi cất giữ hàng triệu câu chuyện về Landmark, Bitexco dưới dạng JSON." },
    { title: "Express", role: "Người vận chuyển", desc: "Xây dựng các con đường (API) an toàn để vận chuyển dữ liệu." },
    { title: "Next.js", role: "Kiến trúc sư", desc: "Quyết định xem trang nào nên xây bằng gạch tĩnh (SSG) hay đổ bê tông tươi (SSR)." },
    { title: "Node.js", role: "Động cơ", desc: "Trái tim JavaScript mạnh mẽ giúp mọi thứ vận hành trơn tru." }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
      <Head><title>MENN Stack Flow | Docs</title></Head>
      <Navbar />
      <main className="max-w-6xl mx-auto py-20 px-6 flex-grow">
        <h1 className="text-4xl font-black mb-16 text-center tracking-widest text-emerald-400">THE DATA PIPELINE</h1>
        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative group hover:border-emerald-500 transition-all">
              <div className="text-5xl font-black opacity-10 absolute right-4 top-4 group-hover:text-emerald-500 transition-colors">0{i+1}</div>
              <h2 className="text-emerald-400 font-bold mb-1 uppercase tracking-tighter">{step.title}</h2>
              <div className="text-[10px] text-slate-400 mb-4 font-mono">{step.role}</div>
              <p className="text-xs leading-relaxed text-slate-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MegaFooter tags={["MongoDB", "Express", "NextJS", "NodeJS"]} />
    </div>
  );
}

export async function getStaticProps() { return { props: {} }; }