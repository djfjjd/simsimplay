import { ensureAdminSchema, mapSong, type SongRow } from "./admin/_schema";

export const runtime = "edge";

type AnalyzeResult = {
  mood: string;
  intensity: number;
  topics: string[];
  message: string;
  action: string;
  musicCategory: string;
  playlist: string;
};

type Track = {
  title: string;
  description: string;
  category: string;
  moodTags: string[];
  tags: string[];
  duration: string;
  musicUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
};

const songSelect = `
  SELECT
    songs.id,
    songs.category_id,
    categories.name AS category_name,
    songs.title,
    songs.slug,
    songs.prompt,
    songs.description,
    songs.mood_tags,
    songs.situation_tags,
    songs.time_tags,
    songs.energy_score,
    songs.status,
    songs.audio_url,
    songs.thumbnail_url,
    songs.youtube_url,
    songs.spotify_url,
    songs.apple_music_url,
    songs.duration,
    songs.created_at,
    songs.updated_at
  FROM songs
  LEFT JOIN categories ON categories.id = songs.category_id
`;

const fallbackTracks: Track[] = [
  {
    title: "Calm Piano for Tired Mind",
    description: "지친 마음의 속도를 낮추는 느린 피아노 루프",
    category: "감정회복",
    moodTags: ["차분함", "회복", "휴식"],
    tags: ["우울", "피로", "회복"],
    duration: "12:40",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
  {
    title: "Deep Sleep Healing Pad",
    description: "잠들기 전 긴장을 풀어주는 부드러운 패드 사운드",
    category: "수면",
    moodTags: ["수면", "안정", "이완"],
    tags: ["불안", "휴식", "수면"],
    duration: "28:00",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
  {
    title: "Anxiety Release Waves",
    description: "불안할 때 마음의 압력을 낮추는 물결형 사운드",
    category: "불안완화",
    moodTags: ["불안완화", "안심", "느림"],
    tags: ["불안", "걱정", "안심"],
    duration: "24:45",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
];

function fallbackAnalyze(content: string): AnalyzeResult {
  const rules = [
    { mood: "불안", keywords: ["불안", "걱정", "초조", "무서워", "미래", "막막"], category: "불안완화", playlist: "불안할 때 듣는 힐링음악" },
    { mood: "피로", keywords: ["지치", "피곤", "번아웃", "쉬고", "졸려"], category: "수면", playlist: "잠들기 전 마음정리" },
    { mood: "우울", keywords: ["우울", "슬퍼", "무기력", "눈물", "외로"], category: "감정회복", playlist: "우울한 날 회복 음악" },
    { mood: "행복", keywords: ["행복", "감사", "설렘", "좋아", "기뻐"], category: "긍정에너지", playlist: "출근길 긍정 에너지" },
  ];
  const hit = rules.find((rule) => rule.keywords.some((keyword) => content.includes(keyword))) ?? rules[0];
  return {
    mood: hit.mood,
    intensity: Math.min(100, Math.max(35, content.length * 2)),
    topics: content.split(/\s+/).filter(Boolean).slice(0, 3),
    message: "지금 적어주신 마음은 여러 생각과 감정이 함께 올라온 상태로 보입니다.",
    action: "오늘은 해결할 일을 3개 이하로만 적고, 가장 작은 것 하나부터 정리해보세요.",
    musicCategory: hit.category,
    playlist: hit.playlist,
  };
}

function extractJson(value: string) {
  const match = value.match(/\{[\s\S]*\}/);
  return match ? match[0] : value;
}

function normalizeResult(value: Partial<AnalyzeResult>, content: string): AnalyzeResult {
  const fallback = fallbackAnalyze(content);
  return {
    mood: typeof value.mood === "string" ? value.mood : fallback.mood,
    intensity:
      typeof value.intensity === "number"
        ? Math.min(100, Math.max(0, Math.round(value.intensity)))
        : fallback.intensity,
    topics: Array.isArray(value.topics) ? value.topics.map(String).slice(0, 5) : fallback.topics,
    message: typeof value.message === "string" ? value.message : fallback.message,
    action: typeof value.action === "string" ? value.action : fallback.action,
    musicCategory:
      typeof value.musicCategory === "string" ? value.musicCategory : fallback.musicCategory,
    playlist: typeof value.playlist === "string" ? value.playlist : fallback.playlist,
  };
}

async function runWorkersAi(env: Env, content: string) {
  if (!env.AI) return null;

  const prompt = `너는 SimSimPlay의 감정정리 도우미다. 의료 진단, 치료, 처방처럼 말하지 말고 "우울증", "불안장애" 같은 진단 표현을 절대 쓰지 마라. 사용자의 일기/단어/메모를 참고해 일상적인 감정정리와 셀프케어를 돕는 참고용 JSON만 반환하라.

반드시 아래 JSON 형식만 반환:
{
  "mood": "불안",
  "intensity": 82,
  "topics": ["진로", "돈", "가족"],
  "message": "지금은 여러 부담이 한꺼번에 몰려와 마음이 무거운 상태로 보입니다.",
  "action": "오늘은 해결해야 할 문제를 3개 이하로만 적고, 가장 작은 것 하나부터 정리해보세요.",
  "musicCategory": "불안완화",
  "playlist": "불안할 때 듣는 힐링음악"
}

사용자 입력:
${content}`;

  const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct" as never, {
    messages: [
      { role: "system", content: "Return only valid JSON. No markdown." },
      { role: "user", content: prompt },
    ],
  } as never);
  const text = String((response as { response?: unknown }).response ?? "");
  return JSON.parse(extractJson(text)) as Partial<AnalyzeResult>;
}

async function getRecommendedTracks(env: Env, result: AnalyzeResult): Promise<Track[]> {
  await ensureAdminSchema(env.DB);
  const { results } = await env.DB.prepare(
    `
      ${songSelect}
      WHERE
        songs.status = 'published'
        AND (
        categories.name = ?
        OR songs.mood_tags LIKE ?
        OR songs.situation_tags LIKE ?
        )
      ORDER BY songs.id DESC
      LIMIT 3
    `,
  )
    .bind(result.musicCategory, `%${result.mood}%`, `%${result.musicCategory}%`)
    .all<SongRow>();

  if (results.length > 0) {
    return results.map((row) => {
      const song = mapSong(row);
      return {
        title: song.title,
        description: song.description || `${song.categoryName} 카테고리에 등록된 음악`,
        category: song.categoryName,
        moodTags: song.emotionTags,
        tags: [...song.emotionTags, ...song.situationTags],
        duration: song.duration,
        musicUrl: song.audioUrl,
        youtubeUrl: song.youtubeUrl,
        spotifyUrl: song.spotifyUrl,
        appleMusicUrl: song.appleMusicUrl,
      };
    });
  }

  const matched = fallbackTracks.filter(
    (track) =>
      track.category === result.musicCategory ||
      track.tags.includes(result.mood) ||
      track.moodTags.includes(result.musicCategory),
  );
  return (matched.length >= 3 ? matched : [...matched, ...fallbackTracks]).slice(0, 3);
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const payload = await request.json<{ content?: unknown }>().catch(() => null);
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";

  if (!content) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  let partial: Partial<AnalyzeResult> | null = null;
  try {
    partial = await runWorkersAi(env, content);
  } catch {
    partial = null;
  }

  const result = normalizeResult(partial ?? fallbackAnalyze(content), content);
  const recommendedMusic = await getRecommendedTracks(env, result);

  return Response.json({
    ...result,
    recommendedMusic,
    notice: "일상적인 감정정리와 셀프케어를 돕는 참고용 결과입니다.",
  });
};
