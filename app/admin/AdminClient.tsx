"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { AdminCategory, Song } from "../lib/adminCatalog";

const emotionOptions = ["수면", "평온", "치유", "불안", "우울", "집중", "희망", "행복", "외로움", "그리움", "명상", "회복"];
const situationOptions = ["잠들기전", "새벽", "아침", "출근길", "퇴근후", "공부", "독서", "드라이브", "카페", "명상", "운동"];
const timeOptions = ["새벽", "아침", "점심", "저녁", "밤"];

type SongForm = {
  id: number | null;
  categoryId: string;
  title: string;
  prompt: string;
  description: string;
  emotionTags: string[];
  situationTags: string[];
  timeTags: string[];
  energyScore: string;
  audioUrl: string;
  thumbnailUrl: string;
};

const emptyForm: SongForm = {
  id: null,
  categoryId: "",
  title: "",
  prompt: "",
  description: "",
  emotionTags: [],
  situationTags: [],
  timeTags: [],
  energyScore: "50",
  audioUrl: "",
  thumbnailUrl: "",
};

export function AdminClient() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [form, setForm] = useState<SongForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // File States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [thumbFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbPreview, setThumbnailPreview] = useState<string>("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("");
  const [filterSituation, setFilterSituation] = useState("");
  const [filterEnergy, setFilterEnergy] = useState("");

  const selectedCategoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: String(category.id) })),
    [categories],
  );

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (song.prompt || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchEmotion = !filterEmotion || song.emotionTags?.includes(filterEmotion);
      const matchSituation = !filterSituation || song.situationTags?.includes(filterSituation);
      const matchEnergy = !filterEnergy || 
                          (filterEnergy === "low" && song.energyScore < 30) ||
                          (filterEnergy === "mid" && song.energyScore >= 30 && song.energyScore < 70) ||
                          (filterEnergy === "high" && song.energyScore >= 70);
      return matchSearch && matchEmotion && matchSituation && matchEnergy;
    });
  }, [songs, searchTerm, filterEmotion, filterSituation, filterEnergy]);

  function updateForm<K extends keyof SongForm>(key: K, value: SongForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(type: 'emotionTags' | 'situationTags' | 'timeTags', tag: string) {
    setForm(current => {
      const tags = current[type];
      const nextTags = tags.includes(tag) 
        ? tags.filter(t => t !== tag) 
        : [...tags, tag];
      return { ...current, [type]: nextTags };
    });
  }

  async function uploadFile(file: File, kind: "audio" | "image"): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);

    const response = await fetch("/api/upload", {
      method: "POST",
      body,
    });
    const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error || "파일 업로드에 실패했습니다.");
    }

    return payload.url;
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      updateForm("audioUrl", file.name);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      updateForm("thumbnailUrl", file.name);
    }
  };

  async function loadData({ showLoading = true } = {}) {
    if (showLoading) setIsLoading(true);
    try {
      const [catRes, songRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/songs")
      ]);
      const catData = (await catRes.json()) as { categories: AdminCategory[] };
      const songData = (await songRes.json()) as { songs: Song[] };
      
      setCategories(catData.categories);
      setSongs(songData.songs);
      
      if (!form.categoryId && catData.categories.length > 0) {
        setForm(prev => ({ ...prev, categoryId: String(catData.categories[0].id) }));
      }
    } catch {
      setMessage("데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleAiTagging() {
    const prompt = form.prompt.trim();
    if (!prompt) {
      setMessage("프롬프트를 입력해주세요.");
      return;
    }

    setIsAiGenerating(true);
    setMessage("AI가 태그를 생성하고 있습니다...");

    try {
      const p = prompt.toLowerCase();
      
      // AI Logic Simulation
      const detectedEmotions = emotionOptions.filter(tag => {
        if (tag === '수면') return p.includes('sleep') || p.includes('dream');
        if (tag === '평온') return p.includes('peaceful') || p.includes('calm') || p.includes('gentle');
        if (tag === '치유') return p.includes('healing') || p.includes('ambient');
        if (tag === '불안') return p.includes('anxious') || p.includes('tension');
        if (tag === '우울') return p.includes('sad') || p.includes('emotional');
        if (tag === '집중') return p.includes('focus') || p.includes('study') || p.includes('minimalist');
        if (tag === '명상') return p.includes('meditation') || p.includes('zen');
        if (tag === '회복') return p.includes('recovery') || p.includes('rest');
        return false;
      });

      const detectedSituations = situationOptions.filter(tag => {
        if (tag === '잠들기전') return p.includes('sleep') || p.includes('night');
        if (tag === '새벽') return p.includes('dawn') || p.includes('night');
        if (tag === '명상') return p.includes('meditation') || p.includes('breath');
        if (tag === '공부') return p.includes('study') || p.includes('focus');
        if (tag === '독서') return p.includes('read') || p.includes('quiet');
        return false;
      });

      const detectedTimes = timeOptions.filter(tag => {
        if (tag === '밤') return p.includes('night') || p.includes('sleep');
        if (tag === '새벽') return p.includes('dawn') || p.includes('night');
        if (tag === '아침') return p.includes('morning') || p.includes('wake');
        return false;
      });

      let energy = 50;
      if (p.includes('piano') || p.includes('slow') || p.includes('minimalist')) energy = 15;
      if (p.includes('energetic') || p.includes('fast') || p.includes('upbeat')) energy = 85;

      // Recommended Category
      let recommendedCategoryName = "감정회복";
      if (p.includes('sleep')) recommendedCategoryName = "수면";
      else if (p.includes('focus') || p.includes('study')) recommendedCategoryName = "집중";
      else if (p.includes('meditation')) recommendedCategoryName = "명상";
      else if (p.includes('anxious')) recommendedCategoryName = "불안완화";
      else if (p.includes('energetic')) recommendedCategoryName = "긍정에너지";

      const matchedCat = categories.find(c => c.name === recommendedCategoryName) || categories[0];

      setForm(prev => ({
        ...prev,
        description: `${detectedSituations[0] || '일상'}에서 마음을 ${detectedEmotions[0] || '편안'}하게 해주는 음악입니다.`,
        emotionTags: detectedEmotions,
        situationTags: detectedSituations,
        timeTags: detectedTimes,
        energyScore: String(energy),
        categoryId: matchedCat ? String(matchedCat.id) : prev.categoryId
      }));
      
      setMessage("AI 태그 생성이 완료되었습니다.");
    } catch {
      setMessage("AI 태그 생성에 실패했습니다.");
    } finally {
      setIsAiGenerating(false);
    }
  }

  async function handleSaveSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("음악 제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setMessage("음악 파일을 저장하고 있습니다...");

    try {
      let audioUrl = form.audioUrl;
      let thumbnailUrl = form.thumbnailUrl;

      if (audioFile) audioUrl = await uploadFile(audioFile, "audio");
      if (thumbFile) thumbnailUrl = await uploadFile(thumbFile, "image");

      if (audioUrl.startsWith("blob:")) {
        setMessage("기존 임시 음원 URL은 재생할 수 없습니다. MP3 파일을 다시 선택해주세요.");
        return;
      }
      if (thumbnailUrl.startsWith("blob:")) thumbnailUrl = "";

      const payload = {
        ...form,
        audioUrl,
        thumbnailUrl,
        categoryId: Number(form.categoryId),
        energyScore: Number(form.energyScore)
      };

      const response = await fetch(form.id ? `/api/songs/${form.id}` : "/api/songs", {
        method: form.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setMessage("음악 저장에 실패했습니다.");
        return;
      }

      setMessage(form.id ? "수정되었습니다." : "추가되었습니다.");
      resetForm();
      loadData({ showLoading: false });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "파일 업로드에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setAudioFile(null);
    setThumbnailFile(null);
    setThumbnailPreview("");
    if (categories.length > 0) {
      setForm(prev => ({ ...prev, categoryId: String(categories[0].id) }));
    }
  }

  function handleEditSong(song: Song) {
    setForm({
      id: song.id,
      categoryId: String(song.categoryId),
      title: song.title,
      prompt: song.prompt || "",
      description: song.description,
      emotionTags: song.emotionTags || [],
      situationTags: song.situationTags || [],
      timeTags: song.timeTags || [],
      energyScore: String(song.energyScore),
      audioUrl: song.audioUrl,
      thumbnailUrl: song.thumbnailUrl,
    });
    setThumbnailPreview(song.thumbnailUrl.startsWith("blob:") ? "" : song.thumbnailUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteSong(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const response = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage("삭제되었습니다.");
      loadData({ showLoading: false });
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Add/Edit Form Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {form.id ? "음악 정보 수정" : "Suno 음악 퀵 등록"}
          </h2>
          {form.id && (
            <button 
              onClick={resetForm}
              className="text-sm text-slate-400 hover:text-white transition underline"
            >
              취소하고 새로 등록하기
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSong} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">곡 제목</label>
              <input
                required
                value={form.title}
                onChange={e => updateForm("title", e.target.value)}
                placeholder="음악의 제목을 입력하세요"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">카테고리</label>
              <select
                value={form.categoryId}
                onChange={e => updateForm("categoryId", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition appearance-none"
              >
                {selectedCategoryOptions.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Suno 프롬프트</label>
            <div className="relative">
              <textarea
                value={form.prompt}
                onChange={e => updateForm("prompt", e.target.value)}
                placeholder="Suno에 사용한 프롬프트를 입력하세요"
                className="w-full min-h-[100px] rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition"
              />
              <button
                type="button"
                onClick={handleAiTagging}
                disabled={isAiGenerating}
                className="absolute bottom-3 right-3 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition disabled:opacity-50"
              >
                {isAiGenerating ? "생성 중..." : "AI 태그 자동 생성"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">mp3 파일 업로드</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3"
                  onChange={handleAudioChange}
                  className="hidden"
                  id="audio-upload"
                />
                <label 
                  htmlFor="audio-upload"
                  className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-white/10 bg-black/30 hover:border-violet-500/50 cursor-pointer transition"
                >
                  <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                  <span className="text-sm text-slate-400">{audioFile ? audioFile.name : "클릭하여 MP3 파일 선택"}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">썸네일 이미지 업로드</label>
              <div className="relative group flex gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumb-upload"
                />
                <label 
                  htmlFor="thumb-upload"
                  className="flex-1 flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-white/10 bg-black/30 hover:border-violet-500/50 cursor-pointer transition overflow-hidden"
                >
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm text-slate-400">이미지 선택</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">곡 설명</label>
            <input
              value={form.description}
              onChange={e => updateForm("description", e.target.value)}
              placeholder="음악에 대한 짧은 설명을 입력하세요"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50 transition"
            />
          </div>

          {/* Tags Checkboxes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-3">감정 태그</label>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('emotionTags', tag)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      form.emotionTags.includes(tag) 
                      ? 'bg-violet-600 text-white ring-2 ring-violet-400/50 shadow-lg' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-3">상황 태그</label>
              <div className="flex flex-wrap gap-2">
                {situationOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('situationTags', tag)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      form.situationTags.includes(tag) 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-lg' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-3">시간대 태그</label>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('timeTags', tag)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      form.timeTags.includes(tag) 
                      ? 'bg-pink-600 text-white ring-2 ring-pink-400/50 shadow-lg' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-white/5">
            <div className="flex-1">
              <label className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                <span>에너지 점수</span>
                <span className="text-violet-400 font-bold">{form.energyScore}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.energyScore}
                onChange={e => updateForm("energyScore", e.target.value)}
                className="w-full accent-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-10 py-4 font-bold text-white shadow-xl shadow-violet-900/20 hover:scale-105 active:scale-95 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : form.id ? "수정 완료" : "음악 등록하기"}
            </button>
          </div>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-pink-400 animate-pulse">{message}</p>
        )}
      </section>

      {/* List Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">음악 카탈로그 관리</h2>
            <p className="mt-2 text-sm text-slate-400">등록된 모든 음악을 테이블 형식으로 관리합니다.</p>
          </div>

          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="검색 (제목, 프롬프트)"
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500/50"
            />
            <select
              value={filterEmotion}
              onChange={e => setFilterEmotion(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">모든 감정</option>
              {emotionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select
              value={filterSituation}
              onChange={e => setFilterSituation(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">모든 상황</option>
              {situationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select
              value={filterEnergy}
              onChange={e => setFilterEnergy(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">모든 에너지</option>
              <option value="low">낮음 (~30)</option>
              <option value="mid">보통 (30~70)</option>
              <option value="high">높음 (70~)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 pl-2 font-bold text-slate-400 text-sm">제목</th>
                <th className="pb-4 font-bold text-slate-400 text-sm">감정태그</th>
                <th className="pb-4 font-bold text-slate-400 text-sm">상황태그</th>
                <th className="pb-4 font-bold text-slate-400 text-sm">에너지</th>
                <th className="pb-4 font-bold text-slate-400 text-sm">등록일</th>
                <th className="pb-4 font-bold text-slate-400 text-sm text-center">수정</th>
                <th className="pb-4 font-bold text-slate-400 text-sm text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">불러오는 중...</td></tr>
              ) : filteredSongs.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">조건에 맞는 음악이 없습니다.</td></tr>
              ) : (
                filteredSongs.map(song => (
                  <tr key={song.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 pl-2">
                      <div className="font-bold text-white">{song.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{song.prompt}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {song.emotionTags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {song.situationTags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-medium text-white">{song.energyScore}</div>
                      <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${song.energyScore}%` }} />
                      </div>
                    </td>
                    <td className="py-4 text-xs text-slate-500">
                      {new Date(song.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => handleEditSong(song)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => handleDeleteSong(song.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
