import Head from 'next/head';
import Navbar from '../../components/Navbar';
import MegaFooter from '../../components/MegaFooter';

export default function HybridDoc({ buildTime }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Head><title>Kiến trúc Hybrid | Docs</title></Head>
      <Navbar />
      <main className="max-w-4xl mx-auto py-20 px-6 flex-grow">
        <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase italic border-b-8 border-emerald-500 inline-block">Hybrid Architecture</h1>
        <p className="text-xl text-slate-600 mb-12 font-medium">Lấy cảm hứng từ sự linh hoạt của giao thông Sài Gòn: Lúc nhanh như cao tốc (SSG), lúc thích ứng như hẻm nhỏ (SSR).</p>

        <section className="space-y-12">
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm">01</span>
              SSG: "Phở Gói"
            </h2>
            <p className="text-slate-600 leading-relaxed">Đã chuẩn bị sẵn trong bao bì. Khách đến chỉ việc xé ra dùng. Tốc độ cực nhanh nhưng nội dung là cố định.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-sm">02</span>
              SSR: "Phở Vỉa Hè"
            </h2>
            <p className="text-slate-600 leading-relaxed">Khách gọi mới bắt đầu trụng bánh, thái thịt. Nóng hổi (Data mới nhất) nhưng khách phải đợi (Latency).</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">03</span>
              ISR: "Cơm Tấm Đang Nướng"
            </h2>
            <p className="text-slate-600 leading-relaxed">Sự kết hợp hoàn hảo. Cơm đã nấu sẵn, nhưng thịt được nướng liên tục để đảm bảo lúc nào cũng ấm nóng (Revalidate).</p>
          </div>
        </section>
      </main>
      <MegaFooter tags={["Hybrid", "NextJS", "Architecture"]} />
    </div>
  );
}

export async function getStaticProps() {
  return { props: { buildTime: new Date().toLocaleTimeString() } };
}