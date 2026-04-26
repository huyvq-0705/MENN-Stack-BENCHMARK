import Head from 'next/head';
import Navbar from '../../components/HomeNavbar';
import MegaFooter from '../../components/MegaFooter';

export default function BlogPost({ post, timeStamp }) {
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-400 text-xs tracking-widest uppercase">Đang tải bài viết...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      <Head>
        <title>{post.title} | Saigon Blog</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Navbar />

      {/* ISR strip — bg-slate-900 to match navbar */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-1.5 flex justify-between items-center">
        <span className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase text-rose-500 opacity-70">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
          ISR Page Live
        </span>
        <span className="text-[9px] text-slate-500 tracking-tight">Built: {timeStamp}</span>
      </div>

      <main className="flex-grow">

        {/* Cover image */}
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article header — white bg */}
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-6">
          <span
            className="text-[10px] font-black tracking-[0.25em] uppercase text-emerald-500 mb-3 block"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
          >
            {post.category || 'Địa danh Sài Gòn'}
          </span>
          <h1
            className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-4"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
          >
            {post.title}
          </h1>
          <p
            className="text-slate-500 text-lg leading-relaxed border-l-2 border-slate-200 pl-4"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
          >
            {post.excerpt}
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <div className="border-t border-slate-200" />
        </div>

        {/* Body — white, readable */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div
            className="
              prose prose-slate max-w-none
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base
              prose-headings:text-slate-900 prose-headings:font-bold
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-2
              prose-strong:text-emerald-600 prose-strong:font-semibold
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
              prose-li:text-slate-700 prose-li:marker:text-emerald-500
              prose-blockquote:border-l-emerald-400 prose-blockquote:text-slate-500
              prose-code:text-emerald-700 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tech note — bg-slate-900 to bring the dark accent back */}
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="bg-slate-900 rounded-md px-5 py-4">
            <span
              className="text-[9px] font-black tracking-[0.2em] uppercase text-emerald-400 block mb-2"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              Technical Architecture
            </span>
            <p className="text-slate-400 text-sm leading-relaxed">
              Trang này là file HTML tĩnh, tạo theo On-demand ISR — tốc độ tải gần như 0ms.
            </p>
          </div>
        </div>

      </main>

      <MegaFooter tags={["Saigon", "Lịch sử", "Seminar", "ISR"]} />
    </div>
  );
}

export async function getStaticPaths() {
  try {
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const res = await fetch(`${BACKEND_BASE}/api/posts`);
    
    if (!res.ok) throw new Error("Backend unreachable during build");
    
    const posts = await res.json();

    return {
      paths: posts.map((post) => ({ params: { slug: post.slug } })),
      fallback: 'blocking',
    };
  } catch (error) {
    console.warn("⚠️ Bỏ qua tạo tĩnh lúc build vì Backend chưa sẵn sàng trong mạng lưới Docker");
    // Nếu lỗi, trả về mảng rỗng. Fallback blocking sẽ lo phần còn lại lúc người dùng truy cập.
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://localhost:5123';
    const res = await fetch(`${BACKEND_BASE}/api/posts/${params.slug}`);
    const post = await res.json();

    if (!post) return { notFound: true };

    return {
      props: {
        post,
        timeStamp: new Date().toLocaleString('vi-VN'),
      },
      revalidate: false,
    };
  } catch {
    return { notFound: true };
  }
}