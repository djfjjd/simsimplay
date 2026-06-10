"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

function playableLinks(song: Song) {
  return [
    ["YouTube", song.youtubeUrl],
    ["Spotify", song.spotifyUrl],
    ["Apple Music", song.appleMusicUrl],
    ["Audio", song.audioUrl],
  ].filter(([, href]) => typeof href === "string" && href.trim() && href !== "#");
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

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {isLoading ? (
        <p className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 text-slate-300">
          D1 음악 데이터를 불러오는 중...
        </p>
      ) : (
        songs.map((song, index) => {
          const tags = listTags(song.moodTags, song.emotionTags, song.situationTags).slice(0, 5);
          const links = playableLinks(song);

          return (
            <article
              key={`${song.id}-${song.title}-${index}`}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/20"
            >
              {song.thumbnailUrl ? (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl">
                  <Image
                    src={song.thumbnailUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : null}
              <p className="text-sm font-semibold text-pink-200">{song.categoryName}</p>
              <h2 className="mt-3 text-2xl font-bold text-white">{song.title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{song.description}</p>
              {tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-5 text-sm text-slate-400">
                재생 시간 {song.duration} / 에너지 {song.energyScore}
              </p>
              {links.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {links.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      className="rounded-full border border-white/10 bg-black/25 px-3 py-3 text-center text-xs font-bold text-white transition hover:bg-white/10"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })
      )}
    </div>
  );
}
