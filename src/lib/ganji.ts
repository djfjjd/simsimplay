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
  // Find i such that i % 10 = stem and i % 12 = branch
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
  
  // 1. Year Ganji: Byeong-o (2026) -> Stem 2 (Byeong), Branch 6 (O)
  const yearStem = (year - 4 + 10) % 10;
  const yearBranch = (year - 4 + 12) % 12;
  const yearGanjiIndex = getGanjiIndex(yearStem, yearBranch);
  const yearGanji = getGanjiByIndex(yearGanjiIndex);

  // 2. Month Ganji: Based on Year Stem and Month
  // Standard rule (Simplified: Month changes on 1st of Gregorian month for this app)
  const monthStemBase = (yearStem * 2 + 2) % 10; // Stem of the 1st month (Feb)
  const monthStem = (monthStemBase + (month - 2 + 12) % 12) % 10;
  const monthBranch = (2 + (month - 2 + 12) % 12) % 12; // Feb is In (2)
  const monthGanjiIndex = getGanjiIndex(monthStem, monthBranch);
  const monthGanji = getGanjiByIndex(monthGanjiIndex);

  // 3. Day Ganji: Base 2024.01.01 was Gap-ja (0)
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
  const keywords = getFortuneKeywordByGanji(info);
  return `오늘은 ${info.dayGanji}일입니다. ${keywords.slice(0, 2).join("과 ")}의 흐름을 참고해, 마음을 가볍게 정리하는 음악을 추천합니다.`;
}
