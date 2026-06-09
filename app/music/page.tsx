import { PageShell } from "../components/PageShell";
import { musicCategories, recommendedTracks } from "../lib/music";

export default function MusicPage() {
  return (
    <PageShell
      eyebrow="Healing Music"
      title="SimSimPlay 힐링음악 라이브러리"
      description="수면, 집중, 명상, 불안완화, 긍정에너지, 감정회복 카테고리별로 제작 예정인 힐링음악을 확인하세요."
    >
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {musicCategories.map((category) => (
          <span
            key={category}
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-slate-200"
          >
            {category}
          </span>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recommendedTracks.map((track) => (
          <article
            key={track.title}
            className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/20"
          >
            <p className="text-sm font-semibold text-pink-200">{track.category}</p>
            <h2 className="mt-3 text-2xl font-bold text-white">{track.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{track.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {track.moodTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-slate-400">재생 시간 {track.duration}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["YouTube", track.youtubeUrl],
                ["Spotify", track.spotifyUrl],
                ["Apple Music", track.appleMusicUrl],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="rounded-full border border-white/10 bg-black/25 px-3 py-3 text-center text-xs font-bold text-white transition hover:bg-white/10"
                >
                  {label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
