import { ensureAdminSchema, mapPlaylist, mapSong, type PlaylistRow, type SongRow } from "./admin/_schema";

const fallbackSongs = [
  {
    id: 0,
    categoryId: null,
    categoryName: "감정회복",
    title: "Calm Piano for Tired Mind",
    description: "지친 마음의 속도를 낮추는 느린 피아노 루프",
    moodTags: ["우울", "피로", "회복"],
    situationTags: ["휴식", "감정정리"],
    energyScore: 28,
    audioUrl: "#",
    thumbnailUrl: "",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
    duration: "12:40",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 0,
    categoryId: null,
    categoryName: "수면",
    title: "Deep Sleep Healing Pad",
    description: "잠들기 전 긴장을 풀어주는 부드러운 패드 사운드",
    moodTags: ["불안", "피로", "수면"],
    situationTags: ["잠들기 전", "휴식"],
    energyScore: 18,
    audioUrl: "#",
    thumbnailUrl: "",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
    duration: "28:00",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 0,
    categoryId: null,
    categoryName: "긍정에너지",
    title: "Morning Positive Energy",
    description: "아침 루틴에 어울리는 밝은 에너지의 힐링음악",
    moodTags: ["행복", "회복", "활력"],
    situationTags: ["아침", "시작"],
    energyScore: 76,
    audioUrl: "#",
    thumbnailUrl: "",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
    duration: "16:20",
    createdAt: "",
    updatedAt: "",
  },
];

const songSelect = `
  SELECT
    songs.id,
    songs.category_id,
    categories.name AS category_name,
    songs.title,
    songs.description,
    songs.mood_tags,
    songs.situation_tags,
    songs.energy_score,
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

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  await ensureAdminSchema(env.DB);

  const url = new URL(request.url);
  const mood = url.searchParams.get("mood")?.trim() ?? "";
  const category = url.searchParams.get("category")?.trim() ?? "";
  const situation = url.searchParams.get("situation")?.trim() ?? "";
  const energy = Number(url.searchParams.get("energy") ?? "50");
  const safeEnergy = Number.isFinite(energy) ? Math.max(0, Math.min(100, energy)) : 50;
  const terms = [mood, category, situation].filter(Boolean);

  const params: unknown[] = [];
  const filters: string[] = [];

  if (category) {
    filters.push("categories.name = ?");
    params.push(category);
  }

  if (terms.length > 0) {
    const termFilters = terms.map(() => "(songs.mood_tags LIKE ? OR songs.situation_tags LIKE ?)");
    filters.push(`(${termFilters.join(" OR ")})`);
    for (const term of terms) params.push(`%${term}%`, `%${term}%`);
  }

  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const { results } = await env.DB.prepare(
    `
      ${songSelect}
      ${where}
      ORDER BY ABS(songs.energy_score - ?) ASC, songs.id DESC
      LIMIT 3
    `,
  )
    .bind(...params, safeEnergy)
    .all<SongRow>();

  const { results: playlistRows } = await env.DB.prepare(
    `
      SELECT
        playlists.id,
        playlists.title,
        playlists.description,
        playlists.situation,
        playlists.mood_tag,
        COUNT(playlist_songs.song_id) AS song_count,
        playlists.total_duration,
        playlists.created_at,
        playlists.updated_at
      FROM playlists
      LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      WHERE playlists.mood_tag LIKE ? OR playlists.situation LIKE ? OR playlists.title LIKE ?
      GROUP BY playlists.id
      ORDER BY playlists.id ASC
      LIMIT 3
    `,
  )
    .bind(`%${mood || category}%`, `%${situation || category}%`, `%${category || mood}%`)
    .all<PlaylistRow>();

  return Response.json({
    songs: results.length > 0 ? results.map(mapSong) : fallbackSongs,
    playlists: playlistRows.map(mapPlaylist),
  });
};
