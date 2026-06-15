"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BlogPost } from "../../lib/adminCatalog";

const CATEGORIES = [
  "꿈해몽", "심리테스트", "심리상담", "운세", "사주오행", "수면", "불안", "우울", "집중", "음악치유"
];

const emptyForm: Partial<BlogPost> = {
  title: "",
  slug: "",
  category: "꿈해몽",
  description: "",
  content: "",
  tags: [],
  status: "draft"
};

export default function AdminBlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<Partial<BlogPost>>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = (await res.json()) as { posts: BlogPost[] };
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || post.category === filterCategory;
      const matchStatus = !filterStatus || post.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [posts, searchTerm, filterCategory, filterStatus]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch(form.id ? `/api/admin/posts/${form.id}` : "/api/admin/posts", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setMessage(form.id ? "수정되었습니다." : "저장되었습니다.");
        setForm(emptyForm);
        fetchPosts();
      } else {
        setMessage(data.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      setMessage("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("삭제되었습니다.");
        fetchPosts();
      }
    } catch (error) {
      setMessage("삭제에 실패했습니다.");
    }
  }

  function handleEdit(post: BlogPost) {
    setForm(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-end">
        <Link 
          href="/admin/blog/bulk"
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-500 transition"
        >
          대량 글 업로드
        </Link>
      </div>

      {/* Form Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="mb-6 text-2xl font-bold text-white">
          {form.id ? "글 수정하기" : "새 글 작성하기"}
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">제목</label>
              <input
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">슬러그 (Slug)</label>
              <input
                required
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="예: police-arrest-dream"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">카테고리</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none appearance-none"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">상태</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none appearance-none"
              >
                <option value="draft">Draft (비공개)</option>
                <option value="published">Published (공개)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">태그 (쉼표 구분)</label>
              <input
                value={form.tags?.join(", ")}
                onChange={e => setForm({ ...form, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">요약 설명 (Description)</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full min-h-[80px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">본문 내용 (Markdown 지원)</label>
            <textarea
              required
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full min-h-[400px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-violet-600 px-10 py-4 font-bold text-white hover:bg-violet-500 transition disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : form.id ? "수정 완료" : "게시글 등록"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="text-sm text-slate-400 hover:text-white underline"
              >
                취소
              </button>
            )}
          </div>
        </form>
        {message && <p className="mt-4 text-pink-400 font-bold">{message}</p>}
      </section>

      {/* List Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="mb-6 text-2xl font-bold text-white">게시글 목록</h2>
        
        {/* Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <input
            placeholder="제목 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          >
            <option value="">모든 카테고리</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          >
            <option value="">모든 상태</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-4 pl-2">제목</th>
                <th className="pb-4">카테고리</th>
                <th className="pb-4">상태</th>
                <th className="pb-4">날짜</th>
                <th className="pb-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-500">불러오는 중...</td></tr>
              ) : filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 pl-2 font-bold text-white">{post.title}</td>
                  <td className="py-4 text-sm text-slate-400">{post.category}</td>
                  <td className="py-4">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      post.status === "published" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {post.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(post)} className="text-violet-400 hover:text-white">수정</button>
                      <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-white">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
