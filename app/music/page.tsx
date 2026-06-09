import { PageShell } from "../components/PageShell";
import { musicCategories, recommendedTracks } from "../lib/music";
import { D1MusicClient } from "./D1MusicClient";

const fallbackSongs = recommendedTracks.map((track, index) => ({
  id: index + 1,
  categoryId: null,
  categoryName: track.category,
  title: track.title,
  prompt: "",
  description: track.description,
  emotionTags: track.moodTags,
  moodTags: track.moodTags,
  situationTags: track.moodTags,
  timeTags: [],
  energyScore: 50,
  audioUrl: track.musicUrl,
  thumbnailUrl: "",
  youtubeUrl: track.youtubeUrl,
  spotifyUrl: track.spotifyUrl,
  appleMusicUrl: track.appleMusicUrl,
  duration: track.duration,
  createdAt: "",
  updatedAt: "",
}));

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
      <D1MusicClient fallbackSongs={fallbackSongs} />
    </PageShell>
  );
}
