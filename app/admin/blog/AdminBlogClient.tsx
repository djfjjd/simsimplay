"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BlogPost } from "../../lib/adminCatalog";

const CATEGORIES = [
  "꿈해몽",
  "심리테스트",
  "심리상담",
  "운세",
  "사주오행",
  "수면",
  "불안",
  "우울",
  "집중",
  "음악치유",
];

const emptyForm: Partial<BlogPost> = {
  title: "",
  slug: "",
  category: "꿈해몽",
  description: "",
  content: "",
  tags: [],
  status: "draft",
};

export default function AdminBlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<Partial<BlogPost>>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = (await res.json()) as { posts: BlogPost[] };
      setPosts(data.posts || []);
      setSelectedIds([]);
      setPage(1);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch = post.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || post.category === filterCategory;
      const matchStatus = !filterStatus || post.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [posts, searchTerm, filterCategory, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / limit));

  const pagedPosts = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return filteredPosts.slice(start, start + limit);
  }, [filteredPosts, page, limit, totalPages]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedPostIds = useMemo(
    () => pagedPosts.map((post) => post.id),
    [pagedPosts]
  );

  const selectedDraftIds = useMemo(
    () =>
      posts
        .filter((post) => post.status === "draft" && selectedIds.includes(post.id))
        .map((post) => post.id),
    [posts, selectedIds]
  );

  const isAllPagedSelected =
    pagedPostIds.length > 0 &&
    pagedPostIds.every((id) => selectedIds.includes(id));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch(
        form.id ? `/api/admin/posts/${form.id}` : "/api/admin/posts",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
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

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      setMessage("삭제할 글을 선택해 주세요.");
      return;
    }

    if (
      !confirm(
        `선택한 글 ${selectedIds.length}개를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = (await res.json()) as { count?: number; error?: string };

      if (res.ok) {
        setMessage(`${data.count || 0}개의 글이 삭제되었습니다.`);
        if (form.id && selectedIds.includes(form.id)) {
          setForm(emptyForm);
        }
        fetchPosts();
      } else {
        setMessage(data.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      setMessage("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handlePublish(ids?: number[]) {
    const isSelectedPublish = Array.isArray(ids);

    if (isSelectedPublish && ids.length === 0) {
      setMessage("발행할 글을 선택해 주세요.");
      return;
    }

    const confirmMessage = isSelectedPublish
      ? `선택한 draft 글 ${ids.length}개를 발행하시겠습니까?`
      : "모든 draft 글을 발행하시겠습니까?";

    if (!confirm(confirmMessage)) return;

    setIsPublishing(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSelectedPublish ? { ids } : {}),
      });
      const data = (await res.json()) as { count?: number; error?: string };

      if (res.ok) {
        setMessage(`${data.count || 0}개의 글이 발행되었습니다.`);
        fetchPosts();
      } else {
        setMessage(data.error || "발행에 실패했습니다.");
      }
    } catch (error) {
      setMessage("발행 중 오류가 발생했습니다.");
    } finally {
      setIsPublishing(false);
    }
  }

  function handleEdit(post: BlogPost) {
    setForm(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }

  function toggleAllPagedPosts() {
    setSelectedIds((prev) => {
      const allSelected =
        pagedPostIds.length > 0 &&
        pagedPostIds.every((id) => prev.includes(id));

      return allSelected
        ? prev.filter((id) => !pagedPostIds.includes(id))
        : Array.from(new Set([...prev, ...pagedPostIds]));
    });
  }

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => handlePublish()}
          disabled={isPublishing}
          className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-500 disabled:opacity-50"
        >
          {isPublishing ? "발행 중..." : "전체 발행"}
        </button>

        <button
          type="button"
          onClick={() => handlePublish(selectedDraftIds)}
          disabled={isPublishing || selectedDraftIds.length === 0}
          className="rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          선택 발행
        </button>

        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={isDeleting || selectedIds.length === 0}
          className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {isDeleting ? "삭제 중..." : "선택 삭제"}
        </button>

        <Link
          href="/admin/blog/bulk"
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition hover:bg-violet-500"
        >
          대량 글 업로드
        </Link>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="mb-6 text-2xl font-bold text-white">
          {form.id ? "글 수정하기" : "새 글 작성하기"}
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-400">
                제목
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-400">
                슬러그 (Slug)
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="비워두면 제목으로 자동 생성"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-400">
                카테고리
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-400">
                상태
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as any })
                }
                className="w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              >
                <option value="draft">Draft (비공개)</option>
                <option value="published">Published (공개)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-400">
                태그 (쉼표 구분)
              </label>
              <input
                value={form.tags?.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-400">
              요약 설명 (Description)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-400">
              본문 내용 (Markdown 지원)
            </label>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-[400px] w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-violet-600 px-10 py-4 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : form.id ? "수정 완료" : "게시글 등록"}
            </button>

            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="text-sm text-slate-400 underline hover:text-white"
              >
                취소
              </button>
            )}
          </div>
        </form>

        {message && <p className="mt-4 font-bold text-pink-400">{message}</p>}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">게시글 목록</h2>
            <p className="mt-1 text-sm text-slate-400">
              총 {filteredPosts.length}개 중 {pagedPosts.length}개 표시
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
            <span>선택 {selectedIds.length}개</span>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={isDeleting || selectedIds.length === 0}
              className="rounded-xl border border-red-400/30 px-4 py-2 text-red-300 transition hover:border-red-300 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              선택 삭제
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <input
            placeholder="제목 검색"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          />

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              resetPage();
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          >
            <option value="">모든 카테고리</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              resetPage();
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          >
            <option value="">모든 상태</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white outline-none"
          >
            <option value={20}>20개씩 보기</option>
            <option value={50}>50개씩 보기</option>
            <option value={100}>100개씩 보기</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-sm text-slate-400">
                <th className="pb-4 pl-2">
                  <input
                    type="checkbox"
                    checked={isAllPagedSelected}
                    onChange={toggleAllPagedPosts}
                    aria-label="현재 페이지 전체 선택"
                    className="h-4 w-4 rounded border-white/20 bg-black/30"
                  />
                </th>
                <th className="pb-4 pl-2">제목</th>
                <th className="pb-4">카테고리</th>
                <th className="pb-4">상태</th>
                <th className="pb-4">날짜</th>
                <th className="pb-4 text-center">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    불러오는 중...
                  </td>
                </tr>
              ) : pagedPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    표시할 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                pagedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 pl-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(post.id)}
                        onChange={() => toggleSelected(post.id)}
                        aria-label={`${post.title} 선택`}
                        className="h-4 w-4 rounded border-white/20 bg-black/30"
                      />
                    </td>

                    <td className="py-4 pl-2 font-bold text-white">
                      {post.title}
                    </td>

                    <td className="py-4 text-sm text-slate-400">
                      {post.category}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          post.status === "published"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {post.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-violet-400 hover:text-white"
                        >
                          수정
                        </button>

                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400 hover:text-white"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            맨처음
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            이전
          </button>

          <span className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 font-bold text-white">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음
          </button>

          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            맨끝
          </button>
        </div>
      </section>
    </div>
  );
}