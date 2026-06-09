import { recommendedTracks, type MusicTrack } from "./music";

export type EmotionType = "우울" | "불안" | "분노" | "피로" | "행복" | "정리필요";

export type MoodAnalysis = {
  emotion: EmotionType;
  intensity: number;
  comfort: string;
  action: string;
  tracks: MusicTrack[];
};

export type DiaryEntry = {
  id: string;
  content: string;
  mood: EmotionType;
  analysis: MoodAnalysis;
  recommendedMusic: MusicTrack[];
  createdAt: string;
};

const emotionRules: Record<
  Exclude<EmotionType, "정리필요">,
  {
    keywords: string[];
    comfort: string;
    action: string;
    categories: string[];
  }
> = {
  우울: {
    keywords: ["우울", "슬퍼", "눈물", "무기력", "외로워", "힘들어"],
    comfort: "지금의 마음이 무겁더라도, 그 감정을 알아차린 것만으로도 이미 정리를 시작한 거예요.",
    action: "따뜻한 물을 마시고 10분만 아무것도 하지 않는 시간을 가져보세요.",
    categories: ["감정회복", "수면", "명상"],
  },
  불안: {
    keywords: ["불안", "걱정", "초조", "무서워", "두려워", "막막"],
    comfort: "불안은 마음이 나를 보호하려고 보내는 신호일 수 있어요. 지금은 속도를 늦춰도 괜찮아요.",
    action: "4초 들이마시고 6초 내쉬는 호흡을 5번 반복해보세요.",
    categories: ["불안완화", "명상", "수면"],
  },
  분노: {
    keywords: ["화나", "짜증", "억울", "열받아", "답답"],
    comfort: "화가 난 마음에는 이유가 있어요. 바로 판단하기보다 감정의 온도를 먼저 낮춰볼게요.",
    action: "지금 떠오르는 말을 메모장에 한 번 적고 잠시 화면을 덮어보세요.",
    categories: ["감정회복", "명상", "집중"],
  },
  피로: {
    keywords: ["피곤", "지쳐", "졸려", "번아웃", "쉬고싶어"],
    comfort: "충분히 애쓴 마음과 몸이 쉬어야 한다고 알려주고 있어요.",
    action: "오늘 해야 할 일 하나를 내일로 미루고 짧은 휴식을 먼저 예약해보세요.",
    categories: ["수면", "감정회복", "불안완화"],
  },
  행복: {
    keywords: ["좋아", "행복", "기뻐", "감사", "설레"],
    comfort: "좋은 감정은 오래 머물 수 있도록 기록해두면 다시 꺼내볼 힘이 됩니다.",
    action: "오늘 좋았던 장면 하나를 한 문장으로 남겨보세요.",
    categories: ["긍정에너지", "집중", "명상"],
  },
};

export function analyzeMood(input: string): MoodAnalysis {
  const normalized = input.replace(/\s+/g, " ").toLowerCase();
  const scored = Object.entries(emotionRules).map(([emotion, rule]) => {
    const matches = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    ).length;

    return { emotion: emotion as EmotionType, matches, rule };
  });

  const best = scored.sort((a, b) => b.matches - a.matches)[0];

  if (!best || best.matches === 0) {
    return {
      emotion: "정리필요",
      intensity: Math.min(55, Math.max(25, Math.round(normalized.length / 3))),
      comfort: "아직 감정의 이름이 선명하지 않아도 괜찮아요. 천천히 적다 보면 마음의 방향이 보일 수 있어요.",
      action: "지금 가장 크게 남아 있는 생각을 한 문장으로 다시 적어보세요.",
      tracks: recommendedTracks.slice(0, 3),
    };
  }

  const intensity = Math.min(
    100,
    Math.max(35, best.matches * 25 + Math.min(45, Math.round(normalized.length / 6))),
  );
  const tracks = recommendedTracks
    .filter((track) => best.rule.categories.includes(track.category))
    .slice(0, 3);

  return {
    emotion: best.emotion,
    intensity,
    comfort: best.rule.comfort,
    action: best.rule.action,
    tracks: tracks.length >= 3 ? tracks : recommendedTracks.slice(0, 3),
  };
}

export const diaryStorageKey = "simsimplay_diary_entries";
export const legacyDiaryStorageKey = "simsimplay.diary.entries";
