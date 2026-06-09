export type MusicTrack = {
  title: string;
  description: string;
  category: string;
  moodTags: string[];
  duration: string;
  musicUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
};

export const recommendedTracks: MusicTrack[] = [
  {
    title: "Calm Piano for Tired Mind",
    description: "지친 마음의 속도를 낮추는 느린 피아노 루프",
    category: "감정회복",
    moodTags: ["차분함", "회복", "휴식"],
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
    duration: "28:00",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
  {
    title: "Morning Positive Energy",
    description: "하루를 가볍게 시작하도록 돕는 밝은 앰비언트",
    category: "긍정에너지",
    moodTags: ["긍정", "시작", "활력"],
    duration: "18:15",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
  {
    title: "Quiet Focus Coding Flow",
    description: "공부와 코딩에 맞춘 반복 피로가 낮은 집중 음악",
    category: "집중",
    moodTags: ["집중", "몰입", "정돈"],
    duration: "32:20",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
  {
    title: "Soft Breath Meditation",
    description: "호흡과 명상 시간을 위한 낮은 밀도의 힐링음악",
    category: "명상",
    moodTags: ["호흡", "명상", "고요"],
    duration: "21:10",
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
    duration: "24:45",
    musicUrl: "#",
    youtubeUrl: "#",
    spotifyUrl: "#",
    appleMusicUrl: "#",
  },
];

export const musicCategories = [
  "수면",
  "집중",
  "명상",
  "불안완화",
  "긍정에너지",
  "감정회복",
] as const;
