"use client";

import { useEffect, useState } from "react";
import type { Playlist } from "../lib/adminCatalog";

const fallbackPlaylists: Playlist[] = [
  {
    id: 1,
    title: "잠들기 전 마음정리",
    description: "생각이 많아 쉽게 잠들기 어려운 밤",
    situation: "잠들기 전",
    songCount: 12,
    totalDuration: "48분",
    moodTag: "수면",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 2,
    title: "출근길 긍정 에너지",
    description: "하루를 시작하기 전 기분을 끌어올리고 싶을 때",
    situation: "출근길",
    songCount: 10,
    totalDuration: "36분",
    moodTag: "긍정",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 3,
    title: "불안할 때 듣는 음악",
    description: "걱정과 초조함이 반복될 때",
    situation: "불안할 때",
    songCount: 14,
    totalDuration: "55분",
    moodTag: "불안완화",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 4,
    title: "우울한 날 회복 음악",
    description: "마음이 무겁고 에너지가 낮은 날",
    situation: "우울한 날",
    songCount: 11,
    totalDuration: "42분",
    moodTag: "회복",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 5,
    title: "공부와 코딩 집중 음악",
    description: "집중은 필요하지만 자극적인 소리는 피하고 싶을 때",
    situation: "공부와 코딩",
    songCount: 16,
    totalDuration: "64분",
    moodTag: "집중",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 6,
    title: "새벽 감성 명상 음악",
    description: "조용한 새벽에 마음을 차분히 바라보고 싶을 때",
    situation: "새벽",
    songCount: 9,
    totalDuration: "38분",
    moodTag: "명상",
    createdAt: "",
    updatedAt: "",
  },
];

export function PlaylistClient() {
  const [playlists, setPlaylists] = useState<Playlist[]>(fallbackPlaylists);

  useEffect(() => {
    void fetch("/api/playlists")
      .then((response) => response.json())
      .then((data) => {
        const payload = data as { playlists: Playlist[] };
        setPlaylists(payload.playlists.length > 0 ? payload.playlists : fallbackPlaylists);
      })
      .catch(() => {
        setPlaylists(fallbackPlaylists);
      });
  }, []);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {playlists.map((playlist) => (
        <button
          key={playlist.id}
          type="button"
          onClick={() => alert("플레이리스트 상세페이지는 준비중입니다.")}
          className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-left shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.1]"
        >
          <span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-100">
            {playlist.moodTag}
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white">{playlist.title}</h2>
          <p className="mt-3 leading-7 text-slate-300">
            {playlist.description || playlist.situation}
          </p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-black/25 p-4 text-sm text-slate-300">
            <span>{playlist.songCount || 0}곡</span>
            <span>{playlist.totalDuration || "-"}</span>
          </div>
          <span className="mt-5 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-3 text-sm font-bold text-white">
            듣기
          </span>
        </button>
      ))}
    </div>
  );
}
