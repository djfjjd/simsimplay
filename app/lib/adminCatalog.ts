export type AdminCategory = {
  id: number;
  name: string;
  created_at: string;
};

export type Song = {
  id: number;
  categoryId: number | null;
  categoryName: string;
  title: string;
  slug: string;
  prompt: string;
  description: string;
  emotionTags: string[];
  moodTags: string[];
  situationTags: string[];
  timeTags: string[];
  energyScore: number;
  status: "draft" | "published";
  audioUrl: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  duration: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminMusicTrack = Song;

export type Playlist = {
  id: number;
  title: string;
  description: string;
  situation: string;
  moodTag: string;
  songCount: number;
  totalDuration: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};
