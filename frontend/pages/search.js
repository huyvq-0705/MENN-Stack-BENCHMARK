import Head from 'next/head';
import Navbar from '../components/HomeNavbar';
import BlogGrid from '../components/BlogGrid';
import MegaFooter from '../components/MegaFooter';

export default function SearchPage({ results, query, timeTaken }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Head>
        <title>Search: {query} | Sài Gòn Blog</title>
      </Head>

      <Navbar />

      {/* SSR Badge - Để demo kỹ thuật trong Seminar */}
      <div className="bg-rose-600 text-white px-6 py-1 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase shadow-lg">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          SSR Real-time Query
        </span>
        <span>Query Time: {timeTaken}ms</span>
      </div>

      <main className="max-w-6xl mx-auto py-16 px-6 flex-grow w-full">
        <div className="mb-12 border-l-8 border-rose-500 pl-6">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Search Results
          </h1>
          <p className="text-slate-500 font-mono text-sm mt-2">
            Showing results for: <span className="text-rose-600 font-bold">"{query}"</span>
          </p>
        </div>

        {results.length > 0 ? (
          <BlogGrid posts={results} modeColor="rose" />
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="text-6xl">🏜️</span>
            <h3 className="text-xl font-bold text-slate-400 mt-4 uppercase tracking-widest">
              No destinations found
            </h3>
            <p className="text-slate-400 text-sm mt-2">Try searching for "Dinh Độc Lập" or "Cafe"</p>
          </div>
        )}
      </main>

      <MegaFooter tags={["Search", "SSR", "Real-time", "MongoDB"]} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { q } = context.query;
  const startTime = Date.now();

  if (!q) {
    return { props: { results: [], query: "", timeTaken: 0 } };
  }

  try {
    // Gọi trực tiếp tới API Search ở Backend
    const BACKEND_BASE = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5123';
    const res = await fetch(`${BACKEND_BASE}/api/search?q=${encodeURIComponent(q)}`);
    const results = await res.json();
    const endTime = Date.now();

    return {
      props: {
        results,
        query: q,
        timeTaken: endTime - startTime
      }
    };
  } catch (error) {
    console.error("SSR Search Error:", error);
    return { props: { results: [], query: q, timeTaken: 0 } };
  }
}