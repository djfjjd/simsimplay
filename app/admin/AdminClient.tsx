"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AdminCategory, Song } from "../lib/adminCatalog";

const defaultCategories = ["수면", "집중", "명상", "행운", "우울", "불안"];

type SongForm = {
  id: number | null;
  categoryId: string;
  title: string;
  description: string;
  moodTags: string;
  situationTags: string;
  energyScore: string;
  audioUrl: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  duration: string;
};

const emptyForm: SongForm = {
  id: null,
  categoryId: "",
  title: "",
  description: "",
  moodTags: "",
  situationTags: "",
  energyScore: "50",
  audioUrl: "#",
  thumbnailUrl: "",
  youtubeUrl: "#",
  spotifyUrl: "#",
  appleMusicUrl: "#",
  duration: "-",
};

function tagsToText(tags: string[]) {
  return tags.join(", ");
}

function formToPayload(form: SongForm) {
  return {
    categoryId: Number(form.categoryId),
    title: form.title.trim(),
    description: form.description.trim(),
    moodTags: form.moodTags,
    situationTags: form.situationTags,
    energyScore: Number(form.energyScore),
    audioUrl: form.audioUrl.trim() || "#",
    thumbnailUrl: form.thumbnailUrl.trim(),
    youtubeUrl: form.youtubeUrl.trim() || "#",
    spotifyUrl: form.spotifyUrl.trim() || "#",
    appleMusicUrl: form.appleMusicUrl.trim() || "#",
    duration: form.duration.trim() || "-",
  };
}

export function AdminClient() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [form, setForm] = useState<SongForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: String(category.id) })),
    [categories],
  );

  function updateForm<K extends keyof SongForm>(key: K, value: SongForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function fetchAdminData() {
    const [categoryResponse, songsResponse] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/songs"),
    ]);

    const categoryData = (await categoryResponse.json()) as {
      categories: AdminCategory[];
    };
    const songsData = (await songsResponse.json()) as {
      songs: Song[];
    };

    return { categories: categoryData.categories, songs: songsData.songs };
  }

  async function loadData({ showLoading = true } = {}) {
    if (showLoading) setIsLoading(true);
    try {
      const data = await fetchAdminData();
      setCategories(data.categories);
      setSongs(data.songs);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || String(data.categories[0]?.id ?? ""),
      }));
    } catch {
      setMessage("관리자 데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    void Promise.all([fetch("/api/admin/categories"), fetch("/api/songs")])
      .then(async ([categoryResponse, songsResponse]) => {
        const categoryData = (await categoryResponse.json()) as {
          categories: AdminCategory[];
        };
        const songsData = (await songsResponse.json()) as {
          songs: Song[];
        };

        return { categories: categoryData.categories, songs: songsData.songs };
      })
      .then((data) => {
        if (!isActive) return;
        setCategories(data.categories);
        setSongs(data.songs);
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || String(data.categories[0]?.id ?? ""),
        }));
      })
      .catch(() => {
        if (isActive) setMessage("관리자 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
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

  async function handleSaveSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formToPayload(form);
    if (!payload.categoryId || !payload.title) {
      setMessage("카테고리와 음악 제목을 입력해주세요.");
      return;
    }

    const response = await fetch(form.id ? `/api/songs/${form.id}` : "/api/songs", {
      method: form.id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "음악 저장에 실패했습니다.");
      return;
    }

    setMessage(form.id ? "음악 정보를 수정했습니다." : "음악을 추가했습니다.");
    setForm({ ...emptyForm, categoryId: form.categoryId });
    await loadData({ showLoading: false });
  }

  function handleEditSong(song: Song) {
    setForm({
      id: song.id,
      categoryId: String(song.categoryId ?? categories[0]?.id ?? ""),
      title: song.title,
      description: song.description,
      moodTags: tagsToText(song.moodTags),
      situationTags: tagsToText(song.situationTags),
      energyScore: String(song.energyScore),
      audioUrl: song.audioUrl,
      thumbnailUrl: song.thumbnailUrl,
      youtubeUrl: song.youtubeUrl,
      spotifyUrl: song.spotifyUrl,
      appleMusicUrl: song.appleMusicUrl,
      duration: song.duration,
    });
    setMessage("수정할 음악 정보를 불러왔습니다.");
  }

  async function handleDeleteSong(id: number) {
    const response = await fetch(`/api/songs/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("음악 삭제에 실패했습니다.");
      return;
    }

    setMessage("음악을 삭제했습니다.");
    if (form.id === id) {
      setForm({ ...emptyForm, categoryId: form.categoryId });
    }
    await loadData({ showLoading: false });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
          onSubmit={handleSaveSong}
          className="rounded-3xl border border-white/10 bg-white/[0.07] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">
              {form.id ? "음악 수정" : "음악 추가"}
            </h2>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm({ ...emptyForm, categoryId: form.categoryId })}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                새 음악
              </button>
            ) : null}
          </div>

          <select
            value={form.categoryId}
            onChange={(event) => updateForm("categoryId", event.target.value)}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
          >
            {selectedCategoryOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {[
            ["title", "음악 제목"],
            ["description", "설명"],
            ["moodTags", "감정 태그, 예: 불안, 회복"],
            ["situationTags", "상황 태그, 예: 잠들기 전, 공부"],
            ["duration", "재생 시간, 예: 24:30"],
            ["audioUrl", "음원 URL, R2 전환 전 직접 입력"],
            ["thumbnailUrl", "썸네일 URL, R2 전환 전 직접 입력"],
            ["youtubeUrl", "YouTube 링크"],
            ["spotifyUrl", "Spotify 링크"],
            ["appleMusicUrl", "Apple Music 링크"],
          ].map(([key, placeholder]) => (
            <input
              key={key}
              value={String(form[key as keyof SongForm])}
              onChange={(event) =>
                updateForm(key as keyof SongForm, event.target.value as never)
              }
              placeholder={placeholder}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-pink-300/40 placeholder:text-slate-500 focus:ring-4"
            />
          ))}

          <label className="mt-4 block text-sm font-bold text-slate-200">
            에너지 점수 {form.energyScore}
            <input
              type="range"
              min="0"
              max="100"
              value={form.energyScore}
              onChange={(event) => updateForm("energyScore", event.target.value)}
              className="mt-3 w-full accent-pink-400"
            />
          </label>

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 px-5 py-3 font-bold text-white transition hover:scale-[1.01]"
          >
            {form.id ? "음악 수정 저장" : "음악 추가"}
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
            <h2 className="text-xl font-bold text-white">D1 음악 카탈로그</h2>
            <p className="mt-2 text-sm text-slate-400">
              웹사이트와 향후 Expo 앱이 같은 API로 읽을 음악 메타데이터입니다.
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
          ) : songs.length === 0 ? (
            <p className="rounded-2xl bg-black/25 p-5 text-slate-300">
              아직 추가된 음악이 없습니다.
            </p>
          ) : (
            songs.map((song) => (
              <article
                key={song.id}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-100">
                        {song.categoryName}
                      </span>
                      <span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-100">
                        에너지 {song.energyScore}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{song.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {song.description || "설명 없음"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      감정: {song.moodTags.join(", ") || "-"} / 상황:{" "}
                      {song.situationTags.join(", ") || "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSong(song)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSong(song.id)}
                      className="rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
