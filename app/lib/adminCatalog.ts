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
  description: string;
  moodTags: string[];
  situationTags: string[];
  energyScore: number;
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
