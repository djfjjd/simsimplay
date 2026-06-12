"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMusicPlayer, type PlayerTrack } from "../components/GlobalMusicPlayer";
import { recommendedTracks, type MusicTrack } from "../lib/music";
import {
  calculateDaewoonTimeline,
  getDaewoonDirection,
  type DaewoonItem,
  type DaewoonDirection,
} from "../../src/lib/daewoon";
import { calculateSaju, getFiveElements, getTodayGanji, type GanjiInfo, type SajuResult } from "../../src/lib/ganji";

type Gender = "여성" | "남성";
type ElementKey = "목" | "화" | "토" | "금" | "수";

type Report = {
  result: SajuResult;
  todayGanji: GanjiInfo;
  gender: Gender;
  birthYear: number;
  counts: Record<ElementKey, number>;
  dominant: ElementKey;
  weak: ElementKey;
  summary: string;
  todayFortune: string;
  fortuneScore: number;
  scoreMessage: DailySajuScoreMessage;
  dailyRoutine: string[];
  daewoonDirection: DaewoonDirection;
  daewoon: DaewoonItem[];
  nextDaewoonGuide: string;
  recommendedCategory: string;
  playlistName: string;
  tracks: MusicTrack[];
  timeline: Array<{ title: string; body: string }>;
  adviceSections: Array<{ title: string; body: string }>;
};

type DailySajuScoreMessage = {
  grade: string;
  title: string;
  description: string;
  advice: string;
};

const hours = [
  { val: "모름", label: "모름 (시간 선택 안함)" },
  { val: "자", label: "자시 (23:00 ~ 01:00)" },
  { val: "축", label: "축시 (01:00 ~ 03:00)" },
  { val: "인", label: "인시 (03:00 ~ 05:00)" },
  { val: "묘", label: "묘시 (05:00 ~ 07:00)" },
  { val: "진", label: "진시 (07:00 ~ 09:00)" },
  { val: "사", label: "사시 (09:00 ~ 11:00)" },
  { val: "오", label: "오시 (11:00 ~ 13:00)" },
  { val: "미", label: "미시 (13:00 ~ 15:00)" },
  { val: "신", label: "신시 (15:00 ~ 17:00)" },
  { val: "유", label: "유시 (17:00 ~ 19:00)" },
  { val: "술", label: "술시 (19:00 ~ 21:00)" },
  { val: "해", label: "해시 (21:00 ~ 23:00)" },
];

const elements: Array<{
  key: ElementKey;
  label: string;
  color: string;
  bg: string;
}> = [
  { key: "목", label: "목(木)", color: "#22c55e", bg: "bg-emerald-400" },
  { key: "화", label: "화(火)", color: "#fb7185", bg: "bg-rose-400" },
  { key: "토", label: "토(土)", color: "#facc15", bg: "bg-yellow-300" },
  { key: "금", label: "금(金)", color: "#cbd5e1", bg: "bg-slate-300" },
  { key: "수", label: "수(水)", color: "#38bdf8", bg: "bg-sky-400" },
];

const branchElements: Record<string, ElementKey> = {
  인: "목",
  묘: "목",
  사: "화",
  오: "화",
  진: "토",
  술: "토",
  축: "토",
  미: "토",
  신: "금",
  유: "금",
  자: "수",
  해: "수",
};

const elementProfiles: Record<ElementKey, {
  strength: string;
  childhood: string;
  teens: string;
  twenties: string;
  later: string;
  fiveYears: string;
  money: string;
  career: string;
  love: string;
  health: string;
  caution: string;
  habit: string;
}> = {
  목: {
    strength: "성장 욕구와 회복 탄력이 강합니다. 새로운 환경에 적응하고 관계를 넓히는 속도가 빠른 편입니다.",
    childhood: "어릴 때부터 호기심이 많고 스스로 해보려는 마음이 강했을 가능성이 큽니다.",
    teens: "10대에는 관심사가 자주 바뀌어도 배움의 폭을 넓히는 시간이 됩니다.",
    twenties: "20대에는 사람, 공부, 일의 방향을 확장하며 자신에게 맞는 판을 찾는 흐름이 강합니다.",
    later: "30대 이후에는 네트워크와 경험이 자산이 되고, 꾸준히 키워온 일이 성과로 연결됩니다.",
    fiveYears: "향후 5년은 새 프로젝트, 이직, 학습 확장이 유리합니다. 시작은 작게, 반복은 길게 가져가세요.",
    money: "재물운은 장기 성장형입니다. 단기 수익보다 꾸준한 적립과 자기계발 투자가 맞습니다.",
    career: "교육, 기획, 콘텐츠, 상담, 브랜드 성장처럼 사람과 방향을 키우는 일이 어울립니다.",
    love: "연애에서는 대화와 미래 계획이 중요합니다. 상대의 성장 속도를 존중하면 안정됩니다.",
    health: "간, 눈, 근육 긴장 관리가 필요합니다. 산책과 스트레칭이 기운을 순환시킵니다.",
    caution: "일을 너무 많이 벌리고 마무리를 뒤로 미루는 행동을 조심하세요.",
    habit: "아침 산책, 주간 목표 3개만 정하기, 식물 돌보기 같은 루틴이 좋습니다.",
  },
  화: {
    strength: "표현력과 추진력이 강합니다. 분위기를 밝히고 사람을 움직이는 힘이 있습니다.",
    childhood: "어린 시절에는 감정 표현이 분명하고 인정받고 싶은 마음이 컸을 수 있습니다.",
    teens: "10대에는 경쟁, 발표, 활동 무대에서 자신감을 얻는 흐름입니다.",
    twenties: "20대에는 빠른 도전과 강한 몰입으로 기회를 잡지만 에너지 관리가 중요합니다.",
    later: "30대 이후에는 영향력과 책임감이 함께 커집니다. 리더십을 안정적으로 다듬는 시기입니다.",
    fiveYears: "향후 5년은 드러나는 일, 발표, 브랜딩, 관계 확장이 좋습니다. 과열만 피하세요.",
    money: "재물운은 기회 포착형입니다. 충동 지출을 줄이면 수익 흐름이 좋아집니다.",
    career: "마케팅, 디자인, 미디어, 영업, 리더 역할처럼 주목도와 설득력이 필요한 일이 맞습니다.",
    love: "연애에서는 애정 표현이 강점입니다. 다만 감정의 속도를 상대에게 강요하지 않는 것이 좋습니다.",
    health: "심장, 혈압, 수면 리듬, 염증성 피로를 조심하세요. 밤 시간을 낮추는 루틴이 필요합니다.",
    caution: "감정이 올라온 순간 바로 결정하거나 말하는 행동을 주의하세요.",
    habit: "취침 전 화면 줄이기, 호흡 명상, 카페인 제한이 기운을 안정시킵니다.",
  },
  토: {
    strength: "현실감과 책임감이 강합니다. 주변을 안정시키고 꾸준히 쌓아가는 힘이 있습니다.",
    childhood: "어릴 때부터 어른스럽거나 책임을 빨리 배웠을 가능성이 있습니다.",
    teens: "10대에는 성실함이 강점이지만, 자기 감정보다 의무를 우선했을 수 있습니다.",
    twenties: "20대에는 기반을 다지는 시기입니다. 자격, 저축, 습관이 미래를 크게 바꿉니다.",
    later: "30대 이후에는 신뢰와 실적이 쌓이며 안정적인 위치를 만들 수 있습니다.",
    fiveYears: "향후 5년은 자산, 일, 생활 기반을 정비하기 좋습니다. 급한 변화보다 구조화가 유리합니다.",
    money: "재물운은 안정 축적형입니다. 부동산, 장기 저축, 예산 관리와 잘 맞습니다.",
    career: "운영, 관리, 회계, 행정, PM, 실무 총괄처럼 체계를 잡는 일이 어울립니다.",
    love: "연애에서는 안정감이 장점입니다. 다만 표현을 아끼면 무심하게 보일 수 있습니다.",
    health: "소화기, 체중, 부종, 무기력 관리가 중요합니다. 규칙적인 식사가 핵심입니다.",
    caution: "걱정만 오래 하며 결정을 미루는 행동을 조심하세요.",
    habit: "식사 시간 고정, 집 정리, 월간 예산표 작성이 운을 안정시킵니다.",
  },
  금: {
    strength: "판단력과 기준이 선명합니다. 복잡한 상황을 정리하고 성과로 압축하는 힘이 있습니다.",
    childhood: "어릴 때부터 규칙, 약속, 공정함에 민감했을 수 있습니다.",
    teens: "10대에는 실력 경쟁과 목표 달성에서 강점이 드러납니다.",
    twenties: "20대에는 전문성을 좁혀가는 흐름입니다. 기준을 세울수록 성과가 빨라집니다.",
    later: "30대 이후에는 실력과 평판이 무기가 됩니다. 리스크 관리 능력이 커집니다.",
    fiveYears: "향후 5년은 자격, 포트폴리오, 재무 구조 정리에 유리합니다. 선택과 집중이 핵심입니다.",
    money: "재물운은 관리와 절제에서 열립니다. 투자 전 원칙을 문서화하면 좋습니다.",
    career: "금융, 법무, 데이터, 개발, 품질관리, 전략처럼 정확성이 필요한 일이 맞습니다.",
    love: "연애에서는 신뢰와 약속이 중요합니다. 비판보다 인정 표현을 늘리면 관계가 부드러워집니다.",
    health: "폐, 피부, 호흡기, 어깨 긴장 관리가 필요합니다. 건조함과 과로를 피하세요.",
    caution: "완벽한 기준으로 자신과 타인을 몰아붙이는 행동을 주의하세요.",
    habit: "업무 체크리스트, 지출 기록, 주 2회 근력 운동이 균형을 돕습니다.",
  },
  수: {
    strength: "직관과 사고의 깊이가 강합니다. 복잡한 감정과 정보를 읽는 능력이 좋습니다.",
    childhood: "어릴 때 조용히 관찰하고 혼자 생각하는 시간이 중요했을 수 있습니다.",
    teens: "10대에는 감수성이 깊어지고 관심 분야에 몰입하는 흐름입니다.",
    twenties: "20대에는 공부, 탐색, 내면 정리가 중요합니다. 서두르기보다 방향을 이해해야 합니다.",
    later: "30대 이후에는 축적된 통찰이 전문성으로 바뀝니다. 조용하지만 강한 영향력이 생깁니다.",
    fiveYears: "향후 5년은 연구, 공부, 회복, 이직 준비처럼 깊이를 쌓는 일이 유리합니다.",
    money: "재물운은 정보력에서 나옵니다. 흐름을 읽되 감정적 소비를 줄이는 것이 중요합니다.",
    career: "연구, 개발, 심리, 음악, 글쓰기, 분석처럼 깊이 파고드는 일이 어울립니다.",
    love: "연애에서는 정서적 안정과 신뢰가 핵심입니다. 마음을 숨기기보다 천천히 표현하세요.",
    health: "신장, 방광, 하체 냉증, 수면의 질을 관리하세요. 몸을 따뜻하게 하는 습관이 좋습니다.",
    caution: "생각이 길어져 실행이 늦어지는 행동을 조심하세요.",
    habit: "따뜻한 물, 명상 음악, 밤 산책, 기록 루틴이 내면 균형을 잡아줍니다.",
  },
};

const weakElementAdvice: Record<ElementKey, {
  analysis: string;
  supplement: string;
  category: string;
  playlist: string;
}> = {
  목: {
    analysis: "목 기운이 부족하면 시작과 확장에 시간이 걸리고, 관계에서 먼저 다가가는 힘이 약해질 수 있습니다.",
    supplement: "초록색 환경, 산책, 아침 루틴, 새로운 배움처럼 성장감을 주는 활동을 늘리세요.",
    category: "긍정에너지",
    playlist: "아침 성장 플레이리스트",
  },
  화: {
    analysis: "화 기운이 부족하면 표현이 줄고, 의욕이 있어도 밖으로 드러내는 데 시간이 걸릴 수 있습니다.",
    supplement: "햇빛, 가벼운 유산소, 발표 연습, 따뜻한 색감의 공간이 활력을 보완합니다.",
    category: "긍정에너지",
    playlist: "활력 회복 플레이리스트",
  },
  토: {
    analysis: "토 기운이 부족하면 계획을 현실화하거나 생활 리듬을 안정시키는 데 흔들림이 생길 수 있습니다.",
    supplement: "정리, 저축, 식사 시간 고정, 체크리스트처럼 생활의 중심을 잡는 루틴을 추천합니다.",
    category: "감정회복",
    playlist: "마음정리 안정 플레이리스트",
  },
  금: {
    analysis: "금 기운이 부족하면 기준 설정, 정리, 결단, 재무 관리에서 망설임이 커질 수 있습니다.",
    supplement: "책상 정리, 지출 기록, 집중 음악, 주간 우선순위 3개 정하기가 금 기운을 보완합니다.",
    category: "집중",
    playlist: "재물운 집중 플레이리스트",
  },
  수: {
    analysis: "수 기운이 부족하면 휴식, 감정 순환, 깊은 사고가 마르기 쉬워 마음이 쉽게 건조해질 수 있습니다.",
    supplement: "명상, 수면 루틴, 물 마시기, 잔잔한 음악으로 회복 시간을 의식적으로 확보하세요.",
    category: "명상",
    playlist: "힐링 명상 플레이리스트",
  },
};

function normalizeElement(value: string): ElementKey {
  return value.slice(0, 1) as ElementKey;
}

function addElement(counts: Record<ElementKey, number>, pillar: string) {
  const stem = pillar[0];
  const branch = pillar[1];
  if (stem && stem !== "?") counts[normalizeElement(getFiveElements(stem))] += 1;
  if (branch && branch !== "?") counts[branchElements[branch] ?? "토"] += 1;
}

function buildElementCounts(result: SajuResult) {
  const counts: Record<ElementKey, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [result.year, result.month, result.day, result.hour].forEach((pillar) => addElement(counts, pillar));
  return counts;
}

function pickDominant(counts: Record<ElementKey, number>) {
  return elements.reduce((best, element) => (
    counts[element.key] > counts[best] ? element.key : best
  ), "목" as ElementKey);
}

function pickWeak(counts: Record<ElementKey, number>) {
  return elements.reduce((best, element) => (
    counts[element.key] < counts[best] ? element.key : best
  ), "목" as ElementKey);
}

function tracksForCategory(category: string) {
  const matches = recommendedTracks.filter((track) => track.category === category);
  return (matches.length > 0 ? matches : recommendedTracks).slice(0, 3);
}

const dailyRoutineByElement: Record<ElementKey, string[]> = {
  목: ["아침에 10분 산책하기", "초록색 환경을 가까이하기", "새로운 배움 하나 시작하기", "아침 루틴을 한 가지 정하기"],
  화: ["햇빛을 10분 이상 보기", "가벼운 운동으로 몸 데우기", "마음을 짧게 표현하기", "따뜻한 음식 챙기기"],
  토: ["식사 시간을 고정하기", "집 안 한 곳만 정리하기", "오늘 쓸 예산표 적기", "반복할 루틴 하나 만들기"],
  금: ["책상 위를 정리하기", "오늘 할 일 3개만 적기", "작은 결정을 미루지 않기", "기록 습관 5분 지키기"],
  수: ["수면 시간을 먼저 정하기", "물 한 잔 자주 마시기", "5분 명상하기", "감정일기 세 줄 쓰기"],
};

const productiveElement: Record<ElementKey, ElementKey> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

const controllingElement: Record<ElementKey, ElementKey> = {
  목: "토",
  토: "수",
  수: "화",
  화: "금",
  금: "목",
};

function getElementKeysByCount(counts: Record<ElementKey, number>, predicate: (count: number) => boolean) {
  return elements.map((element) => element.key).filter((key) => predicate(counts[key]));
}

function buildTodayElementCounts(todayGanji: GanjiInfo) {
  const counts: Record<ElementKey, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  addElement(counts, todayGanji.dayGanji);
  return counts;
}

function getSpread(counts: Record<ElementKey, number>) {
  const values = Object.values(counts);
  return Math.max(...values) - Math.min(...values);
}

function clampScore(score: number) {
  return Math.max(40, Math.min(95, Math.round(score)));
}

export function calculateDailySajuScore(sajuResult: SajuResult, todayGanji: GanjiInfo) {
  const counts = buildElementCounts(sajuResult);
  const todayCounts = buildTodayElementCounts(todayGanji);
  const weakElements = getElementKeysByCount(counts, (count) => count <= 1);
  const strongElements = getElementKeysByCount(counts, (count) => count >= 3);
  const dayMaster = normalizeElement(getFiveElements(sajuResult.day[0] ?? ""));

  let score = 64;
  let complementedCount = 0;

  weakElements.forEach((element) => {
    if (todayCounts[element] > 0) {
      score += 10;
      complementedCount += 1;
    }
  });

  if (complementedCount >= 2) score += 5;

  strongElements.forEach((element) => {
    if (todayCounts[element] >= 2) score -= 5;
  });

  elements.forEach(({ key }) => {
    if (todayCounts[key] === 0) return;
    if (productiveElement[dayMaster] === key || productiveElement[key] === dayMaster) score += 4;
    if (controllingElement[dayMaster] === key || controllingElement[key] === dayMaster) score -= 3;
  });

  const balancedCounts = { ...counts };
  elements.forEach(({ key }) => {
    balancedCounts[key] += todayCounts[key];
  });

  const originalSpread = getSpread(counts);
  const balancedSpread = getSpread(balancedCounts);
  if (balancedSpread < originalSpread) score += 8;
  if (balancedSpread > originalSpread + 1) score -= 4;

  return clampScore(score);
}

export function getDailySajuScoreMessage(score: number): DailySajuScoreMessage {
  if (score >= 90) {
    return {
      grade: "90점대",
      title: "적극적으로 흐름을 타기 좋은 날",
      description: "오늘은 기운의 흐름이 매우 잘 맞아 실행력과 표현력이 살아나기 쉬운 날입니다.",
      advice: "미뤄둔 결정이나 중요한 실행을 현실적인 범위 안에서 진행해도 좋습니다.",
    };
  }

  if (score >= 80) {
    return {
      grade: "80점대",
      title: "계획을 추진하기 좋은 날",
      description: "전체적으로 좋은 흐름이 들어와 계획했던 일을 밀고 나가기 유리합니다.",
      advice: "속도를 내되 무리한 확장보다 이미 준비한 일의 완성도를 높이세요.",
    };
  }

  if (score >= 70) {
    return {
      grade: "70점대",
      title: "루틴과 관계 정리에 좋은 날",
      description: "무난하게 안정적인 흐름이라 큰 부담 없이 작은 실행을 이어가기 좋습니다.",
      advice: "평소 루틴을 유지하고 가까운 관계나 일정을 차분히 정리해보세요.",
    };
  }

  if (score >= 60) {
    return {
      grade: "60점대",
      title: "정리와 점검이 필요한 날",
      description: "오늘은 큰 확장보다 현재 상태를 정리하고 균형을 맞추는 데 유리한 흐름입니다.",
      advice: "무리한 결정보다는 작은 루틴을 지키는 것이 좋습니다.",
    };
  }

  if (score >= 50) {
    return {
      grade: "50점대",
      title: "기복을 조심해야 하는 날",
      description: "기운이 다소 불안정해 감정 기복이나 피로가 평소보다 크게 느껴질 수 있습니다.",
      advice: "충동적인 판단을 피하고 몸의 피로 신호를 먼저 확인하세요.",
    };
  }

  return {
    grade: "40점대",
    title: "쉬어가며 회복에 집중할 날",
    description: "오늘은 무리한 확장보다 정리와 휴식이 필요한 흐름입니다.",
    advice: "중요한 결정은 가능하면 미루고 수면, 식사, 공간 정리부터 챙기세요.",
  };
}

export function getDailySajuRoutine(sajuResult: SajuResult, todayGanji: GanjiInfo) {
  const counts = buildElementCounts(sajuResult);
  const todayCounts = buildTodayElementCounts(todayGanji);
  const weakElements = getElementKeysByCount(counts, (count) => count <= 1);
  const todayWeakElements = getElementKeysByCount(todayCounts, (count) => count === 0);
  const complementedElements = weakElements.filter((element) => todayCounts[element] > 0);
  const priority = [
    ...complementedElements,
    ...weakElements.filter((element) => todayWeakElements.includes(element)),
    ...weakElements,
    pickWeak(counts),
  ];

  const routines = priority.flatMap((element) => dailyRoutineByElement[element]);
  return Array.from(new Set(routines)).slice(0, 4);
}

function buildDailyFortuneText(
  sajuResult: SajuResult,
  todayGanji: GanjiInfo,
  counts: Record<ElementKey, number>,
  dominant: ElementKey,
  weak: ElementKey,
  scoreMessage: DailySajuScoreMessage,
) {
  const todayCounts = buildTodayElementCounts(todayGanji);
  const todayStrong = pickDominant(todayCounts);
  const weakElements = getElementKeysByCount(counts, (count) => count <= 1);
  const strongElements = getElementKeysByCount(counts, (count) => count >= 3);
  const complemented = weakElements.filter((element) => todayCounts[element] > 0);
  const dayMaster = normalizeElement(getFiveElements(sajuResult.day[0] ?? ""));
  const complementedText = complemented.length > 0
    ? `${complemented.join(", ")} 기운이 보완됩니다`
    : `${weak} 기운은 직접 루틴으로 보완하는 편이 좋습니다`;

  return [
    `오늘은 ${todayGanji.dayGanji}일로 ${todayStrong} 기운이 비교적 선명하게 작용합니다.`,
    `원국에서는 ${dominant} 기운이 강하고 ${weak} 기운이 약하게 나타나며, 일간의 중심은 ${dayMaster} 기운으로 볼 수 있습니다.`,
    `오늘 일진이 들어오면 ${complementedText}.`,
    strongElements.includes(todayStrong)
      ? `다만 이미 강한 ${todayStrong} 기운이 다시 커질 수 있어 속도보다 균형을 의식하는 것이 좋습니다.`
      : `부족한 지점을 작은 행동으로 채우면 하루의 체감 흐름이 더 안정됩니다.`,
    `${scoreMessage.description} ${scoreMessage.advice}`,
  ].join(" ");
}

function buildMovementAnalysis(result: SajuResult) {
  const dayBranch = result.day[1] || "?";
  const travelBranchMap: Record<string, string> = {
    신: "인",
    자: "인",
    진: "인",
    인: "신",
    오: "신",
    술: "신",
    사: "해",
    유: "해",
    축: "해",
    해: "사",
    묘: "사",
    미: "사",
  };
  const travelBranch = travelBranchMap[dayBranch] ?? "인";
  const pillars = [result.year, result.month, result.day, result.hour].join("");
  const hasTravel = pillars.includes(travelBranch);

  if (hasTravel) {
    return `일지 ${dayBranch} 기준 역마 기운은 ${travelBranch}로 보며, 원국 안에 해당 흐름이 보여 이동수와 환경 변화에 대한 반응이 비교적 살아나는 편입니다. 출장, 이사, 여행, 부서 이동, 새로운 생활권 진입처럼 자리를 옮기며 기회가 열릴 수 있으니 준비 없는 충동 이동보다 목적이 분명한 이동이 좋습니다.`;
  }

  return `일지 ${dayBranch} 기준 역마 기운은 ${travelBranch}로 보며, 원국 안에서는 강하게 드러나기보다 필요할 때 만들어 쓰는 흐름에 가깝습니다. 이동수는 갑작스러운 변화보다 계획된 외출, 일정한 동선 확장, 업무나 생활 공간의 작은 전환에서 안정적으로 살아납니다.`;
}

function toPlayerTrack(track: MusicTrack): PlayerTrack {
  return {
    id: `fortune-report-${track.title}`,
    title: track.title,
    description: track.description,
    src: track.musicUrl,
    durationLabel: track.duration,
  };
}

function buildReport(result: SajuResult, gender: Gender, birthYear: number): Report {
  const todayGanji = getTodayGanji();
  const counts = buildElementCounts(result);
  const dominant = pickDominant(counts);
  const weak = pickWeak(counts);
  const profile = elementProfiles[dominant];
  const weakAdvice = weakElementAdvice[weak];
  const tracks = tracksForCategory(weakAdvice.category);
  const daewoon = calculateDaewoonTimeline(result, gender, birthYear);
  const daewoonDirection = getDaewoonDirection(gender, birthYear);
  const nextDaewoon = daewoon[1] ?? daewoon[0];
  const fortuneScore = calculateDailySajuScore(result, todayGanji);
  const scoreMessage = getDailySajuScoreMessage(fortuneScore);
  const dailyRoutine = getDailySajuRoutine(result, todayGanji);

  return {
    result,
    todayGanji,
    gender,
    birthYear,
    counts,
    dominant,
    weak,
    summary: `${dominant} 기운이 중심을 잡고 ${weak} 기운을 보완할수록 삶의 균형이 좋아지는 사주풀이입니다.`,
    todayFortune: buildDailyFortuneText(result, todayGanji, counts, dominant, weak, scoreMessage),
    fortuneScore,
    scoreMessage,
    dailyRoutine,
    daewoonDirection,
    daewoon,
    nextDaewoonGuide: `향후 5년은 현재 대운의 후반 흐름과 다음 ${nextDaewoon.age}세 대운의 ${nextDaewoon.keywords.slice(0, 2).join(", ")} 기운으로 이어질 수 있습니다. 급한 확장보다 정리, 자산 관리, 생활 기반 구축에 집중하는 것이 좋습니다.`,
    recommendedCategory: weakAdvice.category,
    playlistName: weakAdvice.playlist,
    tracks,
    timeline: [
      { title: "어린 시절", body: profile.childhood },
      { title: "10대", body: profile.teens },
      { title: "20대", body: profile.twenties },
      { title: "30대 이후", body: profile.later },
      { title: "향후 5년", body: profile.fiveYears },
    ],
    adviceSections: [
      { title: "타고난 성향 분석", body: `${gender} 사주 기준으로 ${dominant} 기운이 중심입니다. ${profile.strength}` },
      { title: "재물운", body: profile.money },
      { title: "직업운", body: profile.career },
      { title: "연애운", body: profile.love },
      { title: "건강운", body: profile.health },
      { title: "이동수(역마살) 분석", body: buildMovementAnalysis(result) },
      { title: "부족한 오행 분석", body: `${weak} 기운이 가장 약하게 나타납니다. ${weakAdvice.analysis}` },
      { title: "부족한 오행 보완 방법", body: weakAdvice.supplement },
      { title: "주의해야 할 행동", body: `${profile.caution} 선택지를 줄이고 실행 단위를 작게 나누는 것이 좋습니다.` },
      { title: "추천 생활 습관", body: profile.habit },
    ],
  };
}

function ElementBars({ counts }: { counts: Record<ElementKey, number> }) {
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="space-y-3">
      {elements.map((element) => {
        const value = counts[element.key];
        return (
          <div key={element.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-bold text-white">{element.label}</span>
              <span className="tabular-nums text-slate-400">{value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${element.bg}`}
                style={{ width: `${Math.max((value / max) * 100, value > 0 ? 10 : 3)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LifeTimeline({ items }: { items: Report["timeline"] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="mb-8">
        <p className="text-sm font-bold text-pink-200">인생 흐름 타임라인</p>
        <h2 className="mt-2 text-2xl font-black text-white">과거에서 향후 5년까지 한눈에 보기</h2>
      </div>

      <div className="hidden grid-cols-5 gap-0 md:grid">
        {items.map((item, index) => (
          <div key={item.title} className="relative px-3 text-center">
            <div className="absolute left-0 right-0 top-3 h-px bg-white/15" />
            {index === 0 ? <div className="absolute left-0 top-3 h-px w-1/2 bg-[#0d1020]" /> : null}
            {index === items.length - 1 ? <div className="absolute right-0 top-3 h-px w-1/2 bg-[#0d1020]" /> : null}
            <div className="relative mx-auto h-6 w-6 rounded-full border-4 border-[#0d1020] bg-pink-300 shadow-lg shadow-pink-500/20" />
            <h3 className="mt-4 text-sm font-black text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="space-y-0 md:hidden">
        {items.map((item, index) => (
          <div key={item.title} className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
            {index !== items.length - 1 ? <div className="absolute bottom-0 left-3 top-6 w-px bg-white/15" /> : null}
            <div className="relative mt-1 h-6 w-6 rounded-full border-4 border-[#0d1020] bg-pink-300" />
            <div>
              <h3 className="text-base font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DaewoonTimeline({
  items,
  direction,
}: {
  items: DaewoonItem[];
  direction: DaewoonDirection;
}) {
  return (
    <section className="h-full rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-pink-200">대운 흐름</p>
          <h2 className="mt-2 text-2xl font-black text-white">10년 단위로 보는 큰 흐름</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            대운은 약 10년 단위로 변화하는 큰 흐름을 참고용으로 정리한 것입니다.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-black text-slate-200">
          {direction} 기준
        </span>
      </div>

      <div className="relative mt-7 space-y-0">
        <div className="absolute bottom-5 left-[0.7rem] top-5 w-px bg-white/15" />
        {items.map((item) => (
          <article key={`${item.age}-${item.ganji}`} className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 pb-4 last:pb-0">
            <div className="relative mt-2 h-5 w-5 rounded-full border-4 border-[#0d1020] bg-sky-300 shadow-lg shadow-sky-500/20" />
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-white">{item.age}세 대운</h3>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">
                    {item.ganji}
                  </span>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {item.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-pink-300/10 px-2.5 py-1 text-xs font-bold text-pink-100">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdviceReport({ sections }: { sections: Report["adviceSections"] }) {
  return (
    <section className="h-full rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="mb-2">
        <p className="text-sm font-bold text-pink-200">상세 조언 리포트</p>
        <h2 className="mt-2 text-2xl font-black text-white">운세별 핵심 해석</h2>
      </div>
      <div className="divide-y divide-white/10">
        {sections.map((section) => (
          <article key={section.title} className="py-4">
            <h3 className="text-base font-black text-white">{section.title}</h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FortuneClient() {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("여성");
  const [birthHour, setBirthHour] = useState("모름");
  const [report, setReport] = useState<Report | null>(null);
  const { playQueue } = useMusicPlayer();

  const formattedDate = useMemo(() => {
    if (birthDate.length !== 8) return "";
    return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
  }, [birthDate]);

  function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formattedDate) return;
    setReport(buildReport(calculateSaju(formattedDate, birthHour), gender, Number(birthDate.slice(0, 4))));
  }

  return (
    <div className="w-full max-w-6xl pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <section className="mx-0 rounded-3xl border border-white/10 bg-white/5 p-4 text-left shadow-xl shadow-black/20 backdrop-blur-sm md:p-6">
        <form onSubmit={handleAnalyze} className="grid gap-4 lg:grid-cols-[1.1fr_0.8fr_1fr_auto] lg:items-end">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-400">
              생년월일 8자리
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              required
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value.replace(/[^0-9]/g, ""))}
              placeholder="19940101"
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none transition placeholder:text-slate-600 focus:ring-4 focus:ring-violet-500/20"
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-bold text-slate-400">성별</legend>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
              {(["여성", "남성"] as Gender[]).map((option) => (
                <label
                  key={option}
                  className={[
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                    gender === option ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={gender === option}
                    onChange={() => setGender(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-400">태어난 시간</label>
            <select
              value={birthHour}
              onChange={(event) => setBirthHour(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none transition focus:ring-4 focus:ring-violet-500/20"
            >
              {hours.map((hour) => (
                <option key={hour.val} value={hour.val} className="bg-[#1a1b26]">
                  {hour.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={birthDate.length !== 8}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-4 font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            내 사주 분석하기
          </button>
        </form>
      </section>

      {report ? (
        <div className="mt-6 space-y-5 text-left md:mt-8 md:space-y-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-stretch">
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 shadow-xl shadow-black/20 md:p-7">
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="text-sm font-bold text-pink-200">사주풀이</p>
                  <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">오늘의 운세</h2>
                  <p className="mt-4 text-base leading-7 text-slate-300">{report.summary}</p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">
                        {report.todayGanji.dateText}
                      </span>
                      <span className="rounded-full bg-pink-300/10 px-3 py-1 text-xs font-black text-pink-100">
                        {report.todayGanji.dayGanji}일
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{report.scoreMessage.title}</h3>
                    <p className="text-base leading-7 text-slate-300">{report.todayFortune}</p>
                  </div>
                </div>
                <div className="mt-auto flex min-h-16 flex-col items-center justify-center text-center">
                  <p className="text-4xl font-black tabular-nums text-white">{report.fortuneScore}/100점</p>
                  <p className="mt-1 text-sm font-bold text-pink-100">{report.scoreMessage.grade}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20 md:p-7">
              <div>
                <p className="text-sm font-bold text-pink-200">오행 비율</p>
                <h2 className="mt-2 text-2xl font-black text-white">사주원국</h2>
                <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 md:p-5">
                  <div className="flex justify-center gap-3 md:justify-start">
                    {[
                      { label: "시주", val: report.result.hour },
                      { label: "일주", val: report.result.day },
                      { label: "월주", val: report.result.month },
                      { label: "연주", val: report.result.year },
                    ].map((pillar) => (
                      <div key={pillar.label} className="flex flex-col items-center">
                        <div className="flex h-24 w-14 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04]">
                          <span className="text-2xl font-black text-white">{pillar.val[0] || "?"}</span>
                          <span className="text-2xl font-black text-white">{pillar.val[1] || "?"}</span>
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-500">{pillar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 md:mt-6">
                <ElementBars counts={report.counts} />
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-pink-200">오늘의 회복 루틴</p>
                <h2 className="mt-2 text-2xl font-black text-white">{report.scoreMessage.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  사주 원국의 부족 오행과 오늘 {report.todayGanji.dayGanji}일의 기운을 함께 반영했습니다.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-black text-slate-200">
                {report.scoreMessage.grade}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {report.dailyRoutine.map((routine, index) => (
                <div key={routine} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="text-xs font-black tabular-nums text-pink-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm font-bold leading-6 text-white">{routine}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{report.scoreMessage.advice}</p>
          </section>

          <LifeTimeline items={report.timeline} />

          <section className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-xl shadow-black/20 sm:p-6">
            <p className="text-sm font-bold text-pink-200">다음 대운 흐름</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{report.nextDaewoonGuide}</p>
          </section>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
            <DaewoonTimeline items={report.daewoon} direction={report.daewoonDirection} />
            <AdviceReport sections={report.adviceSections} />
          </div>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-pink-500/10 p-5 shadow-xl shadow-black/20 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-bold text-pink-200">SimSimPlay 추천 음악</p>
                <h2 className="mt-2 text-3xl font-black text-white">{report.playlistName}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {report.weak} 기운 보완을 위해 {report.recommendedCategory} 음악을 연결했습니다.
                  예: 금 부족은 집중 음악과 재물운 플레이리스트, 수 부족은 명상 음악과 힐링 플레이리스트로 이어집니다.
                </p>
                <button
                  type="button"
                  onClick={() => playQueue(report.tracks.map(toPlayerTrack), 0)}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-pink-100"
                >
                  추천 플레이리스트 재생
                </button>
              </div>

              <div className="grid gap-3">
                {report.tracks.map((track, index) => (
                  <button
                    key={track.title}
                    type="button"
                    onClick={() => playQueue(report.tracks.map(toPlayerTrack), index)}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">{track.title}</p>
                        <p className="mt-1 truncate text-sm text-slate-400">{track.description}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-pink-100">
                        {track.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <p className="text-center text-xs leading-5 text-slate-500">
            본 결과는 전통 명리학 기반의 참고용 콘텐츠이며, 실제 삶의 선택을 대신하지 않습니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}
