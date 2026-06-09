"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AdminCategory, AdminMusicTrack } from "../lib/adminCatalog";

const defaultCategories = ["수면", "집중", "명상", "행운", "우울", "불안"];

function sourceLabel(sourceType: string) {
  return sourceType === "spotify" ? "Spotify" : "YouTube";
}

export function AdminClient() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tracks, setTracks] = useState<AdminMusicTrack[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: String(category.id) })),
    [categories],
  );

  async function fetchAdminData() {
    const [categoryResponse, musicResponse] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/admin/music"),
    ]);

    const categoryData = (await categoryResponse.json()) as {
      categories: AdminCategory[];
    };
    const musicData = (await musicResponse.json()) as {
      tracks: AdminMusicTrack[];
    };

    return { categories: categoryData.categories, tracks: musicData.tracks };
  }

  async function loadData({ showLoading = true } = {}) {
    if (showLoading) setIsLoading(true);
    const data = await fetchAdminData();
    setCategories(data.categories);
    setTracks(data.tracks);
    setSelectedCategoryId((current) => current || String(data.categories[0]?.id ?? ""));
    setIsLoading(false);
  }

  useEffect(() => {
    void fetchAdminData()
      .then((data) => {
        setCategories(data.categories);
        setTracks(data.tracks);
        setSelectedCategoryId((current) => current || String(data.categories[0]?.id ?? ""));
      })
      .catch(() => {
        setMessage("관리자 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      setMessage("카테고리 생성에 실패했습니다.");
      return;
    }

    setCategoryName("");
    setMessage("카테고리를 생성했습니다.");
    await loadData();
  }

  async function handleAddMusic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCategoryId || !musicUrl.trim()) return;

    const response = await fetch("/api/admin/music", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        categoryId: Number(selectedCategoryId),
        title: musicTitle.trim(),
        sourceUrl: musicUrl.trim(),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "음악 추가에 실패했습니다.");
      return;
    }

    setMusicTitle("");
    setMusicUrl("");
    setMessage("링크를 플레이리스트에 추가했습니다.");
    await loadData();
  }

  async function handleDeleteMusic(id: number) {
    const response = await fetch("/api/admin/music", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      setMessage("음악 삭제에 실패했습니다.");
      return;
    }

    setMessage("음악을 삭제했습니다.");
    await loadData();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-6">
        <form
          onSubmit={handleCreateCategory}
          className="rounded-3xl border border-white/10 bg-white/[0.07] p-5"
        >
          <h2 className="text-xl font-bold text-white">카테고리 생성</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            기본 카테고리: {defaultCategories.join(", ")}
          </p>
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="새 카테고리 이름"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-pink-300/40 placeholder:text-slate-500 focus:ring-4"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
          >
            카테고리 생성
          </button>
        </form>

        <form
          onSubmit={handleAddMusic}
          className="rounded-3xl border border-white/10 bg-white/[0.07] p-5"
        >
          <h2 className="text-xl font-bold text-white">음악 추가</h2>
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
          >
            {selectedCategoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <input
            value={musicTitle}
            onChange={(event) => setMusicTitle(event.target.value)}
            placeholder="음악 제목, 비워두면 링크 기반 자동 제목"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-pink-300/40 placeholder:text-slate-500 focus:ring-4"
          />
          <input
            value={musicUrl}
            onChange={(event) => setMusicUrl(event.target.value)}
            placeholder="YouTube 또는 Spotify 링크"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-pink-300/40 placeholder:text-slate-500 focus:ring-4"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 px-5 py-3 font-bold text-white transition hover:scale-[1.01]"
          >
            음악 추가
          </button>
        </form>

        {message ? (
          <p className="rounded-2xl border border-pink-300/20 bg-pink-500/10 p-4 text-sm text-pink-50">
            {message}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">등록된 플레이리스트 음악</h2>
            <p className="mt-2 text-sm text-slate-400">
              YouTube 또는 Spotify 링크가 카테고리별 플레이리스트에 저장됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            새로고침
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <p className="rounded-2xl bg-black/25 p-5 text-slate-300">불러오는 중...</p>
          ) : tracks.length === 0 ? (
            <p className="rounded-2xl bg-black/25 p-5 text-slate-300">
              아직 추가된 음악이 없습니다.
            </p>
          ) : (
            tracks.map((track) => (
              <article
                key={track.id}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-100">
                        {track.category_name}
                      </span>
                      <span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-100">
                        {sourceLabel(track.source_type)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{track.title}</h3>
                    <a
                      href={track.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-sm text-slate-400 hover:text-white"
                    >
                      {track.source_url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteMusic(track.id)}
                    className="rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                  >
                    음악 삭제
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
