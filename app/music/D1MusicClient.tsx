"use client";

import { useEffect, useState } from "react";
import type { Song } from "../lib/adminCatalog";

type D1MusicClientProps = {
  fallbackSongs: Song[];
};

function listTags(...tagLists: Array<unknown>) {
  return tagLists
    .flatMap((tags) => (Array.isArray(tags) ? tags : []))
    .map(String)
    .filter(Boolean);
}

function isPlayableUrl(value: string) {
  return Boolean(value.trim()) && value !== "#" && !value.startsWith("blob:");
}

function serviceLinks(song: Song) {
  return [
    ["YouTube", song.youtubeUrl],
    ["Spotify", song.spotifyUrl],
    ["Apple", song.appleMusicUrl],
  ].filter(([, href]) => typeof href === "string" && isPlayableUrl(href));
}

export function D1MusicClient({ fallbackSongs }: D1MusicClientProps) {
  const [songs, setSongs] = useState<Song[]>(fallbackSongs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/songs")
      .then((response) => response.json())
      .then((data) => {
        const payload = data as { songs: Song[] };
        setSongs(payload.songs.length > 0 ? payload.songs : fallbackSongs);
      })
      .catch(() => {
        setSongs(fallbackSongs);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fallbackSongs]);

  if (isLoading) {
    return (
      <p className="border-y border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-300">
        D1 음악 데이터를 불러오는 중...
      </p>
    );
  }

  return (
    <div className="overflow-hidden border-y border-white/10">
      <div className="hidden grid-cols-[minmax(0,1fr)_110px_90px_210px] gap-4 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 md:grid">
        <span>제목</span>
        <span>카테고리</span>
        <span>에너지</span>
        <span className="text-right">재생 / 링크</span>
      </div>
      <ul className="divide-y divide-white/10">
        {songs.map((song, index) => {
          const tags = listTags(song.moodTags, song.emotionTags, song.situationTags).slice(0, 4);
          const links = serviceLinks(song);
          const canPlayAudio = isPlayableUrl(song.audioUrl);
          const needsReupload = song.audioUrl.startsWith("blob:");

          return (
            <li
              key={`${song.id}-${song.title}-${index}`}
              className="grid gap-3 px-4 py-3 transition hover:bg-white/[0.04] md:grid-cols-[minmax(0,1fr)_110px_90px_210px] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                    {String(index + 1).padStart(3, "0")}
                  </span>
                  <h2 className="truncate text-base font-bold text-white">{song.title}</h2>
                </div>
                <p className="mt-1 truncate text-sm text-slate-400">{song.description || song.prompt}</p>
                {tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-400/10 px-2 py-0.5 text-[11px] text-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="text-sm font-semibold text-pink-200 md:text-slate-300">
                {song.categoryName}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400 md:block">
                <span className="md:hidden">에너지</span>
                <span className="font-semibold tabular-nums text-white">{song.energyScore}</span>
                <span className="text-slate-500">/ {song.duration}</span>
              </div>

              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                {canPlayAudio ? (
                  <a
                    href={song.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-pink-100"
                  >
                    Audio
                  </a>
                ) : needsReupload ? (
                  <span className="rounded-full border border-amber-300/30 px-3 py-1.5 text-xs font-bold text-amber-200">
                    재업로드 필요
                  </span>
                ) : null}

                {links.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
