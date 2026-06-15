"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogPost } from "../../lib/adminCatalog";

declare global {
  interface Window {
    __SIMSIMPLAY_POST__?: BlogPost;
  }
}

function getCurrentSlug(fallback: string) {
  if (typeof window === "undefined") return fallback;
  return decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop() || fallback);
}

function getInitialPost(slug: string) {
  if (typeof window === "undefined") return null;
  const post = window.__SIMSIMPLAY_POST__;
  return post && post.slug === slug ? post : null;
}

export default function PostDetailClient({ slug }: { slug: string }) {
  const [resolvedSlug, setResolvedSlug] = useState(() => getCurrentSlug(slug));
  const [post, setPost] = useState<BlogPost | null>(() => getInitialPost(getCurrentSlug(slug)));
  const [isLoading, setIsLoading] = useState(() => !getInitialPost(getCurrentSlug(slug)));

  useEffect(() => {
    const pathSlug = getCurrentSlug(slug);
    if (pathSlug && pathSlug !== resolvedSlug) {
      setResolvedSlug(pathSlug);
    }
  }, [resolvedSlug, slug]);

  useEffect(() => {
    async function fetchPost() {
      if (!resolvedSlug || resolvedSlug === "__post__") {
        setIsLoading(false);
        return;
      }

      const injectedPost = getInitialPost(resolvedSlug);
      if (injectedPost) {
        setPost(injectedPost);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPost(null);

      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(resolvedSlug)}`);
        const data = (await res.json()) as { post?: BlogPost };
        if (data.post) {
          setPost(data.post);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [resolvedSlug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-white/5" />
        <div className="h-6 w-1/4 animate-pulse rounded-lg bg-white/5" />
        <div className="space-y-4 pt-10">
          <div className="h-4 w-full animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-5/6 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">게시글을 찾을 수 없습니다.</h2>
        <Link href="/blog" className="text-violet-400 hover:underline">블로그 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl pb-20">
      {/* Header */}
      <header className="mb-12 border-b border-white/10 pb-12 text-center">
        <div className="mb-6 flex justify-center gap-2">
          <span className="rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-bold text-violet-400">
            {post.category}
          </span>
        </div>
        <h1 className="mb-6 text-3xl font-bold leading-tight text-white md:text-4xl">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
          {post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-invert max-w-none mb-20 text-slate-300">
        {post.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return <h2 key={i} className="mt-10 mb-4 text-2xl font-bold text-white">{line.replace("## ", "")}</h2>;
          }
          if (line.startsWith("- ")) {
            return <li key={i} className="ml-4 mb-2">{line.replace("- ", "")}</li>;
          }
          if (!line.trim()) return <br key={i} />;
          return <p key={i} className="mb-4 leading-relaxed">{line}</p>;
        })}
      </div>

      {/* CTA Buttons */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <h3 className="mb-8 text-xl font-bold text-white">이런 기능은 어떠세요?</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link 
            href="/mood"
            className="group flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-6 transition hover:bg-violet-600"
          >
            <div className="rounded-full bg-violet-500/20 p-3 group-hover:bg-white/20">
              <svg className="h-6 w-6 text-violet-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm font-bold text-white">AI 감정분석</span>
          </Link>
          <Link 
            href="/fortune"
            className="group flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-6 transition hover:bg-blue-600"
          >
            <div className="rounded-full bg-blue-500/20 p-3 group-hover:bg-white/20">
              <svg className="h-6 w-6 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </div>
            <span className="text-sm font-bold text-white">오늘의 운세</span>
          </Link>
          <Link 
            href="/music"
            className="group flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-6 transition hover:bg-pink-600"
          >
            <div className="rounded-full bg-pink-500/20 p-3 group-hover:bg-white/20">
              <svg className="h-6 w-6 text-pink-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
            <span className="text-sm font-bold text-white">힐링 음악</span>
          </Link>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link href="/blog" className="text-sm text-slate-500 hover:text-white transition">
          ← 블로그 목록으로 돌아가기
        </Link>
      </div>
    </article>
  );
}
