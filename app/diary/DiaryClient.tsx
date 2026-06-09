"use client";

import { useState } from "react";
import {
  diaryStorageKey,
  legacyDiaryStorageKey,
  type DiaryEntry,
  type MoodAnalysis,
} from "../lib/mood";
import type { MusicTrack } from "../lib/music";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type LegacyDiaryEntry = {
  id?: string;
  createdAt?: string;
  input?: string;
  analysis?: MoodAnalysis;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readJsonArray(key: string) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeEntry(value: unknown): DiaryEntry | null {
  if (!isRecord(value)) return null;

  const legacy = value as LegacyDiaryEntry;
  const analysis = legacy.analysis;

  if (!analysis) return null;

  const content =
    typeof value.content === "string"
      ? value.content
      : typeof legacy.input === "string"
        ? legacy.input
        : "";
  const recommendedMusic = Array.isArray(value.recommendedMusic)
    ? (value.recommendedMusic as MusicTrack[])
    : analysis.tracks;

  if (!content) return null;

  return {
    id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
    content,
    mood: analysis.emotion,
    analysis,
    recommendedMusic,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
  };
}

function loadLocalDiaryEntries() {
  const current = readJsonArray(diaryStorageKey)
    .map(normalizeEntry)
    .filter((entry): entry is DiaryEntry => Boolean(entry));

  if (current.length > 0) return current;

  const legacy = readJsonArray(legacyDiaryStorageKey)
    .map(normalizeEntry)
    .filter((entry): entry is DiaryEntry => Boolean(entry));

  if (legacy.length > 0) {
    localStorage.setItem(diaryStorageKey, JSON.stringify(legacy));
  }

  return legacy;
}

export function DiaryClient() {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return loadLocalDiaryEntries();
  });

  function persist(nextEntries: DiaryEntry[]) {
    setEntries(nextEntries);
    localStorage.setItem(diaryStorageKey, JSON.stringify(nextEntries));
  }

  function removeEntry(id: string) {
    persist(entries.filter((entry) => entry.id !== id));
  }

  function clearEntries() {
    persist([]);
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-4 rounded-3xl border border-dashed border-white/15 bg-white/[0.05] p-10 text-center text-slate-300">
        <p>아직 저장된 감정일기가 없습니다</p>
        <p className="text-sm leading-6 text-slate-500">
          감정일기는 서버나 D1에 저장되지 않고 현재 브라우저의 localStorage에만
          보관됩니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={clearEntries}
          className="rounded-full border border-red-300/30 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
        >
          전체 삭제
        </button>
      </div>
      <div className="space-y-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-3xl border border-white/10 bg-white/[0.07] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">{formatDate(entry.createdAt)}</p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {entry.analysis.emotion} · {entry.analysis.intensity}/100
                </h2>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                기록 삭제
              </button>
            </div>
            <p className="mt-4 line-clamp-2 leading-7 text-slate-300">
              {entry.content}
            </p>
            <div className="mt-4 rounded-2xl bg-black/25 p-4">
              <p className="text-sm text-slate-400">추천 음악</p>
              <p className="mt-1 font-semibold text-white">
                {entry.recommendedMusic.map((track) => track.title).join(", ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
