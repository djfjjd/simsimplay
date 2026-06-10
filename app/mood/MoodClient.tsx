"use client";

import { useCallback, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  analyzeMood,
  diaryStorageKey,
  type DiaryEntry,
  type MoodAnalysis,
} from "../lib/mood";
import { useMusicPlayer, type PlayerTrack } from "../components/GlobalMusicPlayer";
import { TodayFortuneMusic } from "../../src/components/TodayFortuneMusic";

function MoodContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { playQueue } = useMusicPlayer();
  
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [saved, setSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("analysis failed");
      }

      const result = (await response.json()) as MoodAnalysis;
      setAnalysis({
        ...result,
        emotion: result.mood,
        comfort: result.message,
        tracks: result.recommendedMusic,
      });
    } catch {
      setAnalysis(analyzeMood(text));
      setError("AI 분석 연결이 불안정해 기본 감정정리 결과를 표시했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      queueMicrotask(() => {
        void handleAnalyze(query);
      });
    }
  }, [handleAnalyze, query]);

  function handleSave() {
    if (!analysis || !query.trim()) return;

    const nextEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      content: query.trim(),
      mood: analysis.emotion,
      analysis,
      recommendedMusic: analysis.tracks,
      createdAt: new Date().toISOString(),
    };

    const previous = JSON.parse(
      localStorage.getItem(diaryStorageKey) ?? "[]",
    ) as DiaryEntry[];

    localStorage.setItem(
      diaryStorageKey,
      JSON.stringify([nextEntry, ...previous]),
    );
    setSaved(true);
  }

  function toPlayerTrack(track: MoodAnalysis["recommendedMusic"][number]): PlayerTrack {
    return {
      id: `recommend-${track.title}`,
      title: track.title,
      description: track.description,
      src: track.musicUrl,
      durationLabel: track.duration,
    };
  }

  const recommendedQueue = analysis?.recommendedMusic.map(toPlayerTrack) ?? [];

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Left Column: Analysis Results */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm">
        {isAnalyzing ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
            <p className="text-lg font-medium text-slate-300">마음을 분석하고 있습니다...</p>
          </div>
        ) : !analysis ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 text-center">
            <p className="text-xl text-slate-400">분석할 내용이 없습니다.</p>
            <Link href="/" className="rounded-full bg-white/10 px-8 py-3 font-bold hover:bg-white/20 transition">
              메인으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {error ? (
              <p className="mb-6 rounded-2xl border border-yellow-300/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                {error}
              </p>
            ) : null}
            
            <div className="mb-8">
              <p className="text-sm font-semibold tracking-wider text-violet-400 uppercase">오늘의 주요 감정</p>
              <h2 className="mt-2 text-5xl font-black text-white">{analysis.mood}</h2>
              
              <div className="mt-8">
                <div className="mb-3 flex justify-between text-sm font-medium text-slate-400">
                  <span>감정 강도</span>
                  <span>{analysis.intensity}/100</span>
                </div>
                <div className="h-4 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 transition-all duration-1000 ease-out"
                    style={{ width: `${analysis.intensity}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {analysis.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-medium text-violet-300"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">공감 메시지</p>
                <p className="mt-3 leading-relaxed text-slate-200">{analysis.message}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">오늘의 추천 행동</p>
                <p className="mt-3 leading-relaxed text-slate-200">{analysis.action}</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-5 text-lg font-bold text-white flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                추천 힐링음악
              </p>
              <div className="grid gap-3">
                {analysis.recommendedMusic.map((track, index) => (
                  <button
                    type="button"
                    key={track.title}
                    onClick={() => playQueue(recommendedQueue, index)}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-5 text-left transition hover:bg-white/10 hover:border-white/10"
                  >
                    <div>
                      <p className="font-bold text-white group-hover:text-pink-300 transition">{track.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{track.description}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500/20 transition">
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saved}
                className={`w-full rounded-2xl py-5 font-bold transition-all ${
                  saved 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default" 
                  : "bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98]"
                }`}
              >
                {saved ? "✓ 감정일기에 저장되었습니다" : "오늘의 분석 결과 저장하기"}
              </button>
              <p className="mt-4 text-center text-xs text-slate-500">
                입력하신 내용은 브라우저의 localStorage에만 안전하게 저장됩니다.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Right Column: Today's Fortune */}
      <aside className="space-y-6">
        <div className="sticky top-24">
          <TodayFortuneMusic />
          <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-pink-500/5 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Guide</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              분석 결과가 마음에 드셨나요? 저장된 일기는 상단 &apos;일기&apos; 메뉴에서 언제든 다시 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function MoodClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    }>
      <MoodContent />
    </Suspense>
  );
}
