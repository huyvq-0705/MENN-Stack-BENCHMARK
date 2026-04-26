// components/BlogGrid.js
import React from 'react';
import Link from 'next/link';

export default function BlogGrid({ posts, modeColor = "emerald" }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
        <p className="text-slate-500 font-mono italic">No posts found in Database.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {posts.map((post) => (
        // Bao bọc toàn bộ article bằng Link để cả thẻ đều có thể click
        <Link 
          key={post._id || post.id} 
          href={`/posts/${post.slug}`}
          className="block group" // Thêm block để Link chiếm toàn bộ diện tích
        >
          <article 
            className={`h-full flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-2xl border-b-4 hover:border-b-${modeColor}-500`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-${modeColor}-600 font-mono text-[10px] font-black uppercase tracking-widest bg-${modeColor}-50 px-2 py-1 rounded`}>
                {post.category || "General"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{post.publishedAt || post.date}</span>
            </div>
            
            <h3 className="text-xl font-bold mb-4 text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className={`text-${modeColor}-600 text-xs font-bold group-hover:underline flex items-center gap-2`}>
                READ MORE <span>&rarr;</span>
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}