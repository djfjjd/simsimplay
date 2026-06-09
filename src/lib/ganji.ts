import { recommendedTracks, type MusicTrack } from "../../app/lib/music";

export const heavenlyStems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const earthlyBranches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;

export type GanjiInfo = {
  dateText: string;
  yearGanji: string;
  monthGanji: string;
  dayGanji: string;
  dayStem: string;
  dayBranch: string;
  line: string;
};

function getKoreanDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return { year, month, day };
}

function formatDate(year: number, month: number, day: number) {
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

function getGanjiIndex(stem: number, branch: number) {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) return i;
  }
  return 0;
}

function getGanjiByIndex(index: number) {
  const normalized = ((index % 60) + 60) % 60;
  return `${heavenlyStems[normalized % 10]}${earthlyBranches[normalized % 12]}`;
}

function daysBetweenUtc(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

export function getTodayGanji(date = new Date()): GanjiInfo {
  const { year, month, day } = getKoreanDateParts(date);
  
  const yearStem = (year - 4 + 10) % 10;
  const yearBranch = (year - 4 + 12) % 12;
  const yearGanjiIndex = getGanjiIndex(yearStem, yearBranch);
  const yearGanji = getGanjiByIndex(yearGanjiIndex);

  const monthStemBase = (yearStem * 2 + 2) % 10;
  const monthStem = (monthStemBase + (month - 2 + 12) % 12) % 10;
  const monthBranch = (2 + (month - 2 + 12) % 12) % 12;
  const monthGanjiIndex = getGanjiIndex(monthStem, monthBranch);
  const monthGanji = getGanjiByIndex(monthGanjiIndex);

  const current = new Date(Date.UTC(year, month - 1, day));
  const base = new Date(Date.UTC(2024, 0, 1));
  const diffDays = daysBetweenUtc(current, base);
  const dayGanjiIndex = ((diffDays % 60) + 60) % 60;
  const dayGanji = getGanjiByIndex(dayGanjiIndex);
  
  const dayStem = dayGanji.slice(0, 1);
  const dayBranch = dayGanji.slice(1);

  return {
    dateText: formatDate(year, month, day),
    yearGanji,
    monthGanji,
    dayGanji,
    dayStem,
    dayBranch,
    line: `${yearGanji}년 ${monthGanji}월 ${dayGanji}일`,
  };
}

export function getHourGanji(dayStem: string, hourName: string): string {
  if (hourName === "모름") return "??";
  
  const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const branchIndex = branches.indexOf(hourName);
  if (branchIndex === -1) return "??";

  const stemMap: Record<string, number> = {
    "갑": 0, "기": 0,
    "을": 2, "경": 2,
    "병": 4, "신": 4,
    "정": 6, "임": 6,
    "무": 8, "계": 8
  };
  
  const startStemIndex = stemMap[dayStem] ?? 0;
  const hourStemIndex = (startStemIndex + branchIndex) % 10;
  
  return heavenlyStems[hourStemIndex] + earthlyBranches[branchIndex];
}

export type SajuResult = {
  year: string;
  month: string;
  day: string;
  hour: string;
  description: string;
};

export function calculateSaju(birthDate: string, birthHour: string): SajuResult {
  const d = new Date(birthDate);
  const info = getTodayGanji(d);
  const hourGanji = getHourGanji(info.dayStem, birthHour);
  
  const element = getFiveElements(info.dayStem);
  
  const elementDescriptions: Record<string, string> = {
    "목(木)": "생명력과 성장의 에너지를 타고나셨습니다. 새로운 일을 시작하는 추진력이 좋고 정이 많은 성품입니다.",
    "화(火)": "열정과 표현력의 에너지를 타고나셨습니다. 솔직하고 화끈한 성격이며 주변을 밝게 만드는 매력이 있습니다.",
    "토(土)": "안정과 신용의 에너지를 타고나셨습니다. 듬직하고 포용력이 있으며 현실적인 감각이 뛰어난 성품입니다.",
    "금(金)": "결단력과 정의의 에너지를 타고나셨습니다. 명확한 판단력을 가졌으며 의리가 있고 섬세한 면모가 있습니다.",
    "수(水)": "지혜와 유연함의 에너지를 타고나셨습니다. 사고가 깊고 이해심이 넓으며 상황에 대처하는 능력이 좋습니다."
  };

  return {
    year: info.yearGanji,
    month: info.monthGanji,
    day: info.dayGanji,
    hour: hourGanji,
    description: `${element} 기운을 가진 사주입니다. ${elementDescriptions[element] || ""}`
  };
}

export function getFiveElements(stem: string): string {
  const elementMap: Record<string, string> = {
    갑: "목(木)", 을: "목(木)",
    병: "화(火)", 정: "화(火)",
    무: "토(土)", 기: "토(土)",
    경: "금(金)", 신: "금(金)",
    임: "수(水)", 계: "수(水)",
  };
  return elementMap[stem] || "목(木)";
}

export function getFortuneKeywordByGanji(info: GanjiInfo) {
  const stemMap: Record<string, string[]> = {
    갑: ["성장", "시작", "회복"],
    을: ["성장", "시작", "회복"],
    병: ["활력", "표현", "자신감"],
    정: ["활력", "표현", "자신감"],
    무: ["안정", "정리", "현실감"],
    기: ["안정", "정리", "현실감"],
    경: ["결단", "정리", "판단"],
    신: ["결단", "정리", "판단"],
    임: ["감정", "휴식", "내면"],
    계: ["감정", "휴식", "내면"],
  };
  const branchMap: Record<string, string[]> = {
    자: ["수면", "명상", "감정정리"],
    해: ["수면", "명상", "감정정리"],
    인: ["시작", "성장", "아침루틴"],
    묘: ["시작", "성장", "아침루틴"],
    사: ["활력", "자신감", "긍정에너지"],
    오: ["활력", "자신감", "긍정에너지"],
    신: ["집중", "정리", "공부"],
    유: ["집중", "정리", "공부"],
    진: ["안정", "회복", "루틴"],
    술: ["안정", "회복", "루틴"],
    축: ["안정", "회복", "루틴"],
    미: ["안정", "회복", "루틴"],
  };

  return Array.from(
    new Set([...(stemMap[info.dayStem] ?? []), ...(branchMap[info.dayBranch] ?? [])]),
  ).slice(0, 7);
}

export function getMusicRecommendationByGanji(info: GanjiInfo): MusicTrack[] {
  const categoryByStem: Record<string, string[]> = {
    갑: ["긍정에너지", "감정회복"],
    을: ["긍정에너지", "감정회복"],
    병: ["긍정에너지"],
    정: ["긍정에너지"],
    무: ["집중", "명상"],
    기: ["집중", "명상"],
    경: ["집중"],
    신: ["집중"],
    임: ["수면", "명상", "불안완화"],
    계: ["수면", "명상", "불안완화"],
  };
  const categoryByBranch: Record<string, string[]> = {
    자: ["수면", "명상"],
    해: ["수면", "명상"],
    인: ["긍정에너지"],
    묘: ["긍정에너지"],
    사: ["긍정에너지"],
    오: ["긍정에너지"],
    신: ["집중"],
    유: ["집중"],
    진: ["감정회복", "명상"],
    술: ["감정회복", "명상"],
    축: ["감정회복", "명상"],
    미: ["감정회복", "명상"],
  };
  const categories = [
    ...(categoryByStem[info.dayStem] ?? []),
    ...(categoryByBranch[info.dayBranch] ?? []),
  ];
  const matches = recommendedTracks.filter((track) => categories.includes(track.category));
  return (matches.length >= 3 ? matches : [...matches, ...recommendedTracks]).slice(0, 3);
}

export function getFortuneSummary(info: GanjiInfo) {
  const element = getFiveElements(info.dayStem);
  const keywords = getFortuneKeywordByGanji(info);
  return `${element} 기운이 강한 날이오니, ${keywords.slice(0, 2).join("과 ")}의 흐름을 참고해 마음을 가볍게 정리하는 음악을 추천합니다.`;
}
