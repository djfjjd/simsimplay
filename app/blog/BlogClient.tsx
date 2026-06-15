"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { BlogPost } from "../lib/adminCatalog";

const CATEGORIES = [
  "전체", "꿈해몽", "심리테스트", "심리상담", "운세", "사주오행", "수면", "불안", "우울", "집중", "음악치유"
];

export default function BlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts");
        const data = (await res.json()) as { posts: BlogPost[] };
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchCategory = selectedCategory === "전체" || post.category === selectedCategory;
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [posts, selectedCategory, searchTerm]);

  const visiblePosts = useMemo(() => filteredPosts.slice(0, pageSize), [filteredPosts, pageSize]);

  return (
    <div className="space-y-8">
      {/* Filters & Search */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            총 <span className="font-bold text-white">{filteredPosts.length}</span>개의 글
          </p>
          <label className="flex items-center gap-3 text-sm text-slate-400">
            <span>보기</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
              <option value={100}>100개씩 보기</option>
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat 
                ? "bg-violet-600 text-white shadow-lg" 
                : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="궁금한 내용을 검색해보세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition md:w-80"
          />
          <svg className="absolute right-4 top-3.5 h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        </div>
      </div>

      {/* Post List */}
      {isLoading ? (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-5">
              <div className="mb-3 h-4 w-24 animate-pulse rounded bg-white/5" />
              <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
          {visiblePosts.map(post => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group block p-5 transition hover:bg-white/[0.06] md:p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-violet-500/10 px-2.5 py-1 font-bold text-violet-400">
                      {post.category}
                    </span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold leading-snug text-white transition group-hover:text-violet-300 md:text-xl">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-400 md:text-base">
                    {post.description}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-slate-500 transition group-hover:text-white">
                  자세히 보기
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-white/5 p-6">
            <svg className="h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <p className="text-slate-400">검색 결과가 없습니다.<br />다른 검색어를 입력해 보세요.</p>
        </div>
      )}
    </div>
  );
}
