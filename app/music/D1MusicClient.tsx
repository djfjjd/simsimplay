"use client";

import { useEffect, useState } from "react";
import type { AdminMusicTrack } from "../lib/adminCatalog";

function platformButton(track: AdminMusicTrack) {
  return track.source_type === "spotify" ? "Spotify 듣기" : "YouTube 듣기";
}

export function D1MusicClient() {
  const [tracks, setTracks] = useState<AdminMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/music")
      .then((response) => response.json())
      .then((data) => {
        const payload = data as { tracks: AdminMusicTrack[] };
        setTracks(payload.tracks);
      })
      .catch(() => {
        setTracks([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
      <h2 className="text-2xl font-bold text-white">관리자가 추가한 음악</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        관리자 페이지에서 YouTube 또는 Spotify 링크를 저장하면 이 영역에 자동으로
        추가됩니다.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <p className="rounded-2xl bg-white/[0.06] p-5 text-slate-300">
            불러오는 중...
          </p>
        ) : tracks.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.06] p-5 text-slate-300">
            아직 D1에 추가된 음악이 없습니다.
          </p>
        ) : (
          tracks.map((track) => (
            <article
              key={track.id}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"
            >
              <span className="rounded-full bg-pink-400/10 px-3 py-1 text-xs font-bold text-pink-100">
                {track.category_name}
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">{track.title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {track.source_type === "spotify" ? "Spotify 링크" : "YouTube 링크"}
              </p>
              <a
                href={track.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-3 text-sm font-bold text-white"
              >
                {platformButton(track)}
              </a>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
