"use client";

import { useMemo, useState } from "react";
import {
  analyzeMood,
  diaryStorageKey,
  type DiaryEntry,
  type MoodAnalysis,
} from "../lib/mood";

export function MoodClient() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [saved, setSaved] = useState(false);

  const canAnalyze = useMemo(() => input.trim().length > 0, [input]);

  function handleAnalyze() {
    if (!canAnalyze) return;
    setAnalysis(analyzeMood(input));
    setSaved(false);
  }

  function handleSave() {
    if (!analysis || !input.trim()) return;

    const nextEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      input: input.trim(),
      analysis,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 sm:p-6">
        <label htmlFor="mood-input" className="text-lg font-bold text-white">
          오늘의 기분이나 있었던 일
        </label>
        <textarea
          id="mood-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="예: 오늘은 일이 너무 많아서 지치고 막막했어요."
          className="mt-4 min-h-52 w-full rounded-3xl border border-white/10 bg-black/30 p-4 leading-7 text-white outline-none ring-pink-300/40 transition placeholder:text-slate-500 focus:ring-4"
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 px-6 py-4 font-bold text-white transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          분석하기
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
        {!analysis ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-white/15 p-6 text-center text-slate-400">
            마음을 입력하고 분석하면 결과가 여기에 표시됩니다.
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-pink-200">감정 유형</p>
            <h2 className="mt-2 text-4xl font-black text-white">
              {analysis.emotion}
            </h2>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm text-slate-300">
                <span>감정 강도</span>
                <span>{analysis.intensity}/100</span>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400"
                  style={{ width: `${analysis.intensity}%` }}
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/[0.07] p-4">
                <p className="text-sm text-slate-400">짧은 위로</p>
                <p className="mt-2 leading-7 text-white">{analysis.comfort}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-4">
                <p className="text-sm text-slate-400">오늘의 추천 행동</p>
                <p className="mt-2 leading-7 text-white">{analysis.action}</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-3 font-bold text-white">추천 힐링음악</p>
              <div className="space-y-3">
                {analysis.tracks.map((track) => (
                  <a
                    key={track.title}
                    href={track.musicUrl}
                    className="block rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]"
                  >
                    <p className="font-semibold text-white">{track.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{track.description}</p>
                  </a>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="mt-6 w-full rounded-full border border-pink-300/40 bg-pink-500/15 px-5 py-4 font-bold text-pink-50 transition hover:bg-pink-500/25"
            >
              {saved ? "감정일기에 저장됨" : "감정일기에 저장하기"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
