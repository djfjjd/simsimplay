export type AdminCategory = {
  id: number;
  name: string;
  created_at: string;
};

export type AdminMusicTrack = {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  source_type: "youtube" | "spotify";
  source_url: string;
  created_at: string;
};

