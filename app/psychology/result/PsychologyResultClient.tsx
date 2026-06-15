"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { recommendedTracks } from "../../lib/music";
import {
  calculatePsychologyResult,
  type PsychologyQuestion,
  type PsychologyResult,
  type PsychologyScoreKey,
} from "../../../src/lib/psychologyQuestions";
import { calculateDaewoonTimeline, getDaewoonDirection, type DaewoonItem } from "../../../src/lib/daewoon";
import { calculateSaju, getFiveElements, getTodayGanji, type GanjiInfo, type SajuResult } from "../../../src/lib/ganji";

type Gender = "여성" | "남성";
type ElementKey = "목" | "화" | "토" | "금" | "수";

type PsychologyProfile = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  gender: Gender;
};

type CombinedStoredResult = {
  profile: PsychologyProfile;
  psychology: PsychologyResult;
  saju: SajuResult;
  todayGanji: GanjiInfo;
  elementCounts: Record<ElementKey, number>;
  dominantElement: ElementKey;
  weakElement: ElementKey;
  daewoon: DaewoonItem[];
  todayFortuneScore: number;
  createdAt: string;
};

type FullReport = {
  mentalState: string;
  emotionalPattern: string;
  thoughtPattern: string;
  stressCause: string;
  anxietyCause: string;
  energyState: string;
  selfEsteemAnalysis: string;
  relationshipAnalysis: string;
  socialityAnalysis: string;
  careerAnalysis: string;
  burnoutRisk: string;
  recoveryNeed: string;
  avoidActions: string[];
  oneMonthTips: string;
  threeMonthTips: string;
  cautions: string[];
  recommendedActions: string[];
  journalQuestions: string[];
  sajuNature: string;
  daewoonFlow: string;
  recoveryRoutine: string[];
  sajuCautions: string[];
  usefulEnergy: string;
  combinedInterpretation: string[];
  playlists: string[];
  songs: string[];
};

let devUnlockToken: string | null = null;

const profileKey = "simsimplay_psychology_profile";
const answersKey = "simsimplay_psychology_answers";
const questionsKey = "simsimplay_psychology_questions";
const resultKey = "simsimplay_psychology_result";

const scoreLabels: Record<PsychologyScoreKey, string> = {
  stress: "스트레스",
  anxiety: "불안",
  lowMood: "우울",
  selfEsteem: "자존감",
  sociality: "사회성",
  relationship: "대인관계",
  career: "직업성향",
};

const cautionKeys: PsychologyScoreKey[] = ["stress", "anxiety", "lowMood"];
const strengthKeys: PsychologyScoreKey[] = ["selfEsteem", "sociality", "relationship", "career"];
const elementNames: ElementKey[] = ["목", "화", "토", "금", "수"];
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

const elementMessages: Record<ElementKey, { nature: string; routine: string[]; caution: string; useful: string; playlist: string }> = {
  목: {
    nature: "성장과 확장 감각이 살아 있어 새로운 시도와 배움에서 회복감을 얻을 가능성이 있습니다.",
    routine: ["아침 산책 10분", "오늘 키울 일 한 가지 적기", "초록색 환경 가까이 두기"],
    caution: "일을 넓히기만 하고 마무리를 미루는 흐름을 조심해볼 수 있습니다.",
    useful: "작게 시작하고 반복하는 목의 기운을 활용하면 좋습니다.",
    playlist: "아침 성장 플레이리스트",
  },
  화: {
    nature: "표현과 활력의 감각이 강해 감정을 밖으로 정리할 때 마음이 가벼워질 가능성이 있습니다.",
    routine: ["햇빛 보기", "가벼운 유산소", "감정 한 문장 말로 표현하기"],
    caution: "감정이 올라온 순간 바로 결정하거나 말하는 흐름을 주의해볼 수 있습니다.",
    useful: "따뜻하게 움직이고 표현하는 화의 기운을 활용하면 좋습니다.",
    playlist: "활력 회복 플레이리스트",
  },
  토: {
    nature: "현실감과 책임감이 중심에 있어 생활 기반을 정리할수록 안정감을 얻을 가능성이 있습니다.",
    routine: ["식사 시간 고정", "방 한 곳 정리", "오늘 예산 한 줄 기록"],
    caution: "걱정을 오래 붙잡으며 결정을 미루는 흐름을 조심해볼 수 있습니다.",
    useful: "루틴과 정리로 중심을 잡는 토의 기운을 활용하면 좋습니다.",
    playlist: "마음정리 안정 플레이리스트",
  },
  금: {
    nature: "기준과 판단이 선명해 복잡한 상황을 정리하고 우선순위를 세우는 데 강점이 있을 가능성이 있습니다.",
    routine: ["책상 위 정리", "오늘 할 일 3개만 선택", "짧은 근력 운동"],
    caution: "완벽한 기준으로 자신을 몰아붙이는 흐름을 주의해볼 수 있습니다.",
    useful: "선택지를 줄이고 결론을 내는 금의 기운을 활용하면 좋습니다.",
    playlist: "집중 정리 플레이리스트",
  },
  수: {
    nature: "내면을 깊이 살피는 감각이 있어 조용한 회복과 기록에서 균형을 찾을 가능성이 있습니다.",
    routine: ["따뜻한 물 마시기", "5분 호흡", "잠들기 전 감정일기 세 줄"],
    caution: "생각이 길어져 실행이 늦어지는 흐름을 조심해볼 수 있습니다.",
    useful: "쉬고 관찰하며 감정을 순환시키는 수의 기운을 활용하면 좋습니다.",
    playlist: "힐링 명상 플레이리스트",
  },
};

function isReportUnlocked(token: string | null) {
  return Boolean(token && devUnlockToken && token === devUnlockToken);
}

function unlockReport() {
  devUnlockToken = `dev-${crypto.randomUUID()}`;
  return devUnlockToken;
}

function verifyPaymentSession() {
  return false;
}

function handlePaymentClick() {
  if (verifyPaymentSession()) return null;
  return unlockReport();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeElement(value: string): ElementKey {
  return value.slice(0, 1) as ElementKey;
}

function addElement(counts: Record<ElementKey, number>, pillar: string) {
  const stem = pillar[0];
  const branch = pillar[1];
  if (stem && stem !== "?") counts[normalizeElement(getFiveElements(stem))] += 1;
  if (branch && branch !== "?") counts[branchElements[branch] ?? "토"] += 1;
}

function getElementCounts(saju: SajuResult) {
  const counts: Record<ElementKey, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [saju.year, saju.month, saju.day, saju.hour].forEach((pillar) => addElement(counts, pillar));
  return counts;
}

function pickElement(counts: Record<ElementKey, number>, mode: "max" | "min") {
  return elementNames.reduce((best, element) => {
    if (mode === "max") return counts[element] > counts[best] ? element : best;
    return counts[element] < counts[best] ? element : best;
  }, "목" as ElementKey);
}

function clampScore(value: number) {
  return Math.max(42, Math.min(96, Math.round(value)));
}

function calculateTodayFortuneScore(counts: Record<ElementKey, number>, todayGanji: GanjiInfo) {
  const todayElement = normalizeElement(getFiveElements(todayGanji.dayStem));
  const weak = pickElement(counts, "min");
  const dominant = pickElement(counts, "max");
  let score = 66;
  if (todayElement === weak) score += 14;
  if (todayElement === dominant) score -= 5;
  score += Math.max(0, 4 - counts[weak]) * 3;
  return clampScore(score);
}

function buildStoredResult(): CombinedStoredResult | null {
  const profile = readJson<PsychologyProfile | null>(profileKey, null);
  const questions = readJson<PsychologyQuestion[]>(questionsKey, []);
  const answers = readJson<Record<string, number>>(answersKey, {});
  if (!profile || questions.length !== 50 || Object.keys(answers).length < 50) return null;

  const birthYear = Number(profile.birthYear);
  const birthMonth = String(profile.birthMonth).padStart(2, "0");
  const birthDay = String(profile.birthDay).padStart(2, "0");
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
  const psychology = calculatePsychologyResult(questions, answers);
  const saju = calculateSaju(birthDate, profile.birthHour);
  const todayGanji = getTodayGanji();
  const elementCounts = getElementCounts(saju);
  const dominantElement = pickElement(elementCounts, "max");
  const weakElement = pickElement(elementCounts, "min");
  const daewoon = calculateDaewoonTimeline(saju, profile.gender, birthYear);

  return {
    profile,
    psychology,
    saju,
    todayGanji,
    elementCounts,
    dominantElement,
    weakElement,
    daewoon,
    todayFortuneScore: calculateTodayFortuneScore(elementCounts, todayGanji),
    createdAt: new Date().toISOString(),
  };
}

function getPreviewReport(result: CombinedStoredResult) {
  const highSignals = result.psychology.dominantSignals.map((key) => scoreLabels[key]).join("와 ");
  const weakProfile = elementMessages[result.weakElement];
  return [
    `현재 ${highSignals} 관련 응답이 비교적 높게 나타났습니다.`,
    `사주 흐름상 현재는 ${result.weakElement} 기운을 보완하며 정리와 회복을 참고해볼 수 있는 시기로 해석됩니다.`,
    `오늘은 무리한 확장보다 감정 정리와 생활 루틴 회복에 집중하는 것이 좋습니다. ${weakProfile.routine[0]}부터 시작해보세요.`,
  ];
}

function scoreTone(score: number, caution: boolean) {
  if (caution) {
    if (score >= 81) return "매우 강하게 올라온 신호";
    if (score >= 61) return "분명하게 관리가 필요한 신호";
    if (score >= 41) return "평균 범위 안에서 흔들리는 신호";
    return "현재는 비교적 낮게 나타난 신호";
  }
  if (score >= 81) return "매우 선명한 강점";
  if (score >= 61) return "잘 활용할 수 있는 강점";
  if (score >= 41) return "상황에 따라 달라지는 보통 수준의 자원";
  return "지금은 의식적으로 보완하면 좋은 자원";
}

function topKeys(scores: Record<PsychologyScoreKey, number>, keys: PsychologyScoreKey[], count: number) {
  return [...keys].sort((a, b) => scores[b] - scores[a]).slice(0, count);
}

function getFullReport(result: CombinedStoredResult): FullReport {
  const scores = result.psychology.scores;
  const highestSignal = result.psychology.dominantSignals[0];
  const strongest = result.psychology.strengths[0];
  const secondStrength = result.psychology.strengths[1];
  const highCautions = topKeys(scores, cautionKeys, 3);
  const highStrengths = topKeys(scores, strengthKeys, 4);
  const dominantProfile = elementMessages[result.dominantElement];
  const weakProfile = elementMessages[result.weakElement];
  const tracks = recommendedTracks.slice(0, 5);
  const stressTone = scoreTone(scores.stress, true);
  const anxietyTone = scoreTone(scores.anxiety, true);
  const lowMoodTone = scoreTone(scores.lowMood, true);
  const esteemTone = scoreTone(scores.selfEsteem, false);
  const socialTone = scoreTone(scores.sociality, false);
  const relationshipTone = scoreTone(scores.relationship, false);
  const careerTone = scoreTone(scores.career, false);
  const mainSignalText = highCautions.map((key) => scoreLabels[key]).join(", ");
  const strengthText = highStrengths.map((key) => scoreLabels[key]).join(", ");

  return {
    mentalState: `현재 마음 상태는 ${scoreLabels[highestSignal]} 신호를 중심으로 읽을 수 있습니다. ${mainSignalText} 순서로 에너지가 많이 쓰이고 있으며, 이는 단순히 기분이 좋고 나쁨의 문제가 아니라 최근 생활 리듬, 관계 부담, 해야 할 일의 압박이 마음속에서 동시에 처리되고 있을 가능성을 보여줍니다. 지금은 더 밀어붙이는 방식보다 마음이 어디에서 오래 멈춰 있는지 확인하는 과정이 필요합니다.`,
    emotionalPattern: `감정 패턴은 긴장과 회복 욕구가 함께 나타나는 형태입니다. 스트레스는 ${stressTone}, 불안은 ${anxietyTone}, 우울 관련 마음 신호는 ${lowMoodTone}로 정리됩니다. 감정이 한 번 올라오면 바로 사라지기보다 생각으로 이어지고, 생각이 다시 몸의 피로감이나 집중 저하로 연결될 가능성이 있습니다. 따라서 감정을 없애려 하기보다 이름을 붙이고, 오늘 처리할 감정과 내일로 넘겨도 되는 감정을 구분하는 방식이 잘 맞습니다.`,
    thoughtPattern: `사고 패턴에서는 ${scoreLabels[strongest]}와 ${scoreLabels[secondStrength]} 자원이 핵심입니다. 강점은 ${strengthText} 쪽에 있으며, 이는 스스로를 회복시키는 기준이 될 수 있습니다. 다만 부담 신호가 높을 때는 장점이 오히려 '더 잘해야 한다', '내가 정리해야 한다'는 압박으로 바뀔 수 있습니다. 완벽한 결론을 내기 전까지 움직이지 못하는 패턴이 있다면, 결론보다 작은 실행을 먼저 두는 편이 안정적입니다.`,
    stressCause: `스트레스 원인은 해야 할 일의 양 자체보다, 책임을 정리하는 방식에서 생길 가능성이 있습니다. 여러 요구가 동시에 들어올 때 우선순위를 세우기 전에 마음이 먼저 반응하고, 작은 변수도 전체 일정이 무너지는 느낌으로 확대될 수 있습니다. 특히 휴식 중에도 해야 할 일을 떠올리는 패턴이 있다면 실제 업무 시간보다 심리적 대기 시간이 길어져 피로가 누적되기 쉽습니다.`,
    anxietyCause: `불안 원인은 미래의 불확실성을 미리 계산하려는 마음과 연결됩니다. 아직 일어나지 않은 상황을 대비하려는 능력은 장점이지만, 지금은 대비가 반복 확인과 걱정으로 넘어갈 가능성이 있습니다. 오늘 해결할 수 없는 문제를 계속 붙잡으면 몸은 계속 경계 상태에 머물 수 있으므로, 확인 가능한 사실과 추측을 분리하는 습관이 필요합니다.`,
    energyState: `에너지 상태는 회복 잔량을 먼저 살펴야 하는 구간입니다. 집중력, 수면 리듬, 감정 반응 속도가 평소보다 예민하다면 의지 부족이 아니라 사용 가능한 에너지가 얇아진 상태로 볼 수 있습니다. 오늘은 생산성을 크게 끌어올리기보다 에너지가 새는 지점을 줄이는 것이 더 현실적입니다.`,
    selfEsteemAnalysis: `자존감은 ${esteemTone}으로 나타납니다. 점수가 높다면 자신을 다시 세우는 언어가 어느 정도 살아 있다는 뜻이고, 낮다면 최근의 피로가 자기평가까지 흔들었을 가능성이 있습니다. 중요한 것은 지금의 점수를 성격의 고정값으로 보지 않는 것입니다. 자존감은 결과보다 반복되는 자기 대화의 영향을 크게 받으므로, 오늘 한 일을 작게라도 인정하는 기록이 도움이 됩니다.`,
    relationshipAnalysis: `대인관계 성향은 ${relationshipTone}입니다. 관계에서 상대의 반응을 세심하게 읽는 힘이 있지만, 그만큼 내가 원하는 거리와 속도를 말하기 전에 상대에게 맞추는 흐름이 생길 수 있습니다. 가까운 관계일수록 설명하지 않은 기대가 쌓이면 서운함으로 바뀔 수 있으니, 큰 대화보다 짧고 명확한 표현을 늘리는 것이 좋습니다.`,
    socialityAnalysis: `사회성은 ${socialTone}으로 볼 수 있습니다. 사람들과 함께할 때 얻는 자극과 소모되는 에너지가 동시에 존재할 가능성이 있습니다. 활발함 자체보다 상황을 읽고 역할을 찾는 능력이 중요하게 나타나며, 모임이나 협업 뒤에는 회복 시간을 일정에 포함해야 사회적 에너지가 안정적으로 유지됩니다.`,
    careerAnalysis: `직업 성향은 ${careerTone}입니다. 지금은 성과를 내고 싶은 마음과 안정적인 구조를 원하는 마음이 함께 보입니다. 업무나 진로에서는 큰 목표를 선언하는 것보다, 기준을 세우고 우선순위를 좁히는 방식이 잘 맞습니다. ${scoreLabels[strongest]} 강점을 살리되, 모든 일을 혼자 책임지는 구조는 피하는 것이 좋습니다.`,
    burnoutRisk: `번아웃 위험도는 스트레스 ${scores.stress}점, 우울 관련 마음 신호 ${scores.lowMood}점, 불안 ${scores.anxiety}점을 함께 보아 판단할 수 있습니다. 세 항목 중 두 개 이상이 높다면 현재는 몰입을 늘리는 시기보다 회복 시간을 공식 일정으로 잡아야 하는 시기입니다. 즐거운 일마저 의무처럼 느껴진다면 즉시 할 일의 총량을 줄여야 합니다.`,
    recoveryNeed: `현재 가장 필요한 회복 요소는 ${result.weakElement} 기운을 보완하는 루틴과 심리적으로는 '정리된 하루'의 감각입니다. ${weakProfile.useful} 이 방향은 사주 해석과 심리 결과를 연결했을 때도 무리한 확장보다 반복 가능한 생활 회복에 더 가깝습니다.`,
    avoidActions: [
      "피곤한 상태에서 큰 결정을 바로 내리기",
      "감정이 올라온 직후 중요한 메시지를 길게 보내기",
      "휴식 시간을 죄책감으로 채우기",
      "모든 문제를 혼자 정리하려고 하기",
      "잠을 줄여서 부족한 시간을 메우기",
    ],
    oneMonthTips: "앞으로 1개월은 회복 루틴을 새로 만드는 기간으로 보는 것이 좋습니다. 수면 시간, 식사 시간, 하루 할 일 3개 제한을 먼저 고정하고, 감정 기록은 길게 쓰기보다 세 줄만 반복하세요. 관계나 일에서 불편함이 생기면 바로 결론을 내리지 말고 사실, 감정, 요청을 나누어 적어보는 방식이 도움이 됩니다.",
    threeMonthTips: "앞으로 3개월은 생활 기반을 정리한 뒤 방향을 다시 선택하는 흐름이 잘 맞습니다. 첫 달에는 회복, 둘째 달에는 관계와 일정 조정, 셋째 달에는 일과 진로의 우선순위 재정리를 권합니다. 큰 변화를 한 번에 만들기보다 반복 가능한 기준을 세우면 심리적 안정감과 실행력이 함께 올라갈 가능성이 있습니다.",
    cautions: [
      "결과를 단정적인 판단으로 받아들이기보다 현재 상태를 정리하는 참고 자료로 활용하세요.",
      "감정 신호가 높게 느껴지는 날에는 중요한 결정을 잠시 미루고 수면과 식사를 먼저 확인하세요.",
      "혼자 감당하기 어렵다고 느껴지면 신뢰할 수 있는 사람이나 전문가의 도움을 검토하세요.",
    ],
    recommendedActions: [
      weakProfile.routine[0],
      "오늘 할 일을 3개 이하로 줄이기",
      "잠들기 전 감정일기 세 줄 적기",
      "확인 가능한 사실과 추측을 나누어 적기",
      "가까운 사람에게 필요한 도움을 한 문장으로 요청하기",
    ],
    journalQuestions: [
      "오늘 내 마음을 가장 많이 차지한 감정은 무엇이었나요?",
      "내가 지금 줄여도 되는 부담은 무엇인가요?",
      "내일의 나를 위해 오늘 작게 회복할 수 있는 행동은 무엇인가요?",
      "내가 사실로 확인한 것과 아직 추측하고 있는 것은 무엇인가요?",
      "요즘 나에게 가장 필요한 말은 무엇인가요?",
    ],
    sajuNature: dominantProfile.nature,
    daewoonFlow: `대운은 ${getDaewoonDirection(result.profile.gender, Number(result.profile.birthYear))} 기준으로 보며, 다음 흐름은 ${result.daewoon[1]?.age ?? result.daewoon[0]?.age}세 전후 ${result.daewoon[1]?.ganji ?? result.daewoon[0]?.ganji} 기운을 참고해볼 수 있습니다.`,
    recoveryRoutine: weakProfile.routine,
    sajuCautions: [weakProfile.caution, "운세 해석은 선택의 방향을 가볍게 점검하는 참고 콘텐츠로 보는 것이 좋습니다."],
    usefulEnergy: weakProfile.useful,
    combinedInterpretation: [
      `이번 종합 결과는 단순히 점수가 높고 낮다는 이야기가 아니라, 지금 마음이 어떤 방식으로 에너지를 쓰고 있는지 보여주는 참고 자료입니다. 심리 응답에서는 ${scoreLabels[highestSignal]} 신호가 가장 앞에 나타났고, 이어서 ${mainSignalText} 흐름이 함께 확인됩니다. 이는 최근의 마음이 한 가지 감정으로만 설명되기보다, 해야 할 일의 압박, 앞으로의 걱정, 회복되지 않은 피로가 서로 영향을 주고 있을 가능성을 보여줍니다. 특히 긴장 상태가 오래 이어지면 사소한 일도 크게 느껴지고, 쉬는 시간에도 마음이 완전히 내려오지 않을 수 있습니다. 지금 필요한 것은 스스로를 더 몰아붙이는 해석이 아니라, 마음이 계속 대기 상태에 머무는 이유를 차분히 구분하는 일입니다.`,
      `사주 흐름에서는 ${result.dominantElement} 기운이 중심으로 보이며, ${dominantProfile.nature} 이 기운은 본래 상황을 밀고 나가거나 자신만의 기준을 세우는 데 도움이 될 수 있습니다. 다만 심리 결과에서 부담 신호가 함께 높게 나타날 때는 이 장점이 '더 해내야 한다'는 압박으로 바뀔 가능성도 있습니다. 강점은 계속 증명해야 하는 숙제가 아니라 회복을 설계하는 도구로 쓰는 편이 좋습니다. 예를 들어 책임감이 강한 사람은 쉬는 일도 일정에 넣어야 실제로 쉬고, 분석력이 좋은 사람은 걱정을 반복하기보다 확인 가능한 사실과 추측을 나누어야 마음이 가벼워질 수 있습니다.`,
      `부족하게 나타난 ${result.weakElement} 기운은 지금의 회복 방향을 잡는 데 참고할 수 있습니다. ${weakProfile.useful} 심리적으로도 같은 흐름이 보입니다. 큰 결심이나 급격한 변화보다, 작고 반복 가능한 행동을 통해 몸과 마음이 다시 예측 가능한 리듬을 느끼는 것이 중요합니다. 특히 ${weakProfile.routine.join(", ")} 같은 루틴은 너무 단순해 보여도 현재 상태에서는 효과적인 회복 신호가 될 수 있습니다. 마음이 지쳐 있을수록 거창한 계획은 실패 경험으로 남기 쉽기 때문에, 성공 가능성이 높은 작은 행동을 반복하는 편이 더 안정적입니다.`,
      `${scoreLabels[strongest]}와 ${scoreLabels[secondStrength]} 항목은 현재 당신이 이미 가지고 있는 심리적 자원으로 볼 수 있습니다. 이 자원은 대인관계, 일, 자기관리에서 분명한 힘이 될 수 있지만, 피로가 누적된 시기에는 장점이 부담으로 바뀌기도 합니다. 사람을 잘 살피는 능력은 타인의 기분을 과도하게 책임지는 방향으로 흐를 수 있고, 기준을 세우는 능력은 스스로를 평가하는 잣대가 될 수 있습니다. 따라서 앞으로 한동안은 강점을 밖으로 더 많이 쓰기보다 안쪽으로 돌려, 내 감정의 이름을 붙이고 내가 감당할 수 있는 범위를 정하는 데 활용해볼 수 있습니다.`,
      `오늘의 운세 점수는 ${result.todayFortuneScore}점으로 계산됩니다. 이 수치는 하루의 좋고 나쁨을 단정하는 예언이 아니라, 오늘의 기운을 어떻게 생활 리듬과 연결할지 보는 참고 지표입니다. 점수가 높게 느껴지는 날에도 무리하게 확장할 필요는 없고, 점수가 낮게 느껴지는 날에도 하루 전체가 나쁜 것은 아닙니다. 오히려 오늘은 선택지를 줄이고, 회복에 필요한 조건을 먼저 확보하는 방식이 잘 맞습니다. 식사, 수면, 공간 정리, 짧은 산책처럼 몸이 바로 이해할 수 있는 행동이 마음의 불확실성을 낮추는 데 도움이 될 가능성이 있습니다.`,
      `앞으로 1개월은 회복의 기본값을 다시 세우는 시간으로 참고해볼 수 있습니다. 새로운 목표를 많이 추가하기보다 지금 이미 들고 있는 부담을 덜어내고, 하루를 마쳤을 때 '완벽하진 않아도 정리됐다'는 감각을 만드는 것이 우선입니다. 앞으로 3개월은 그 기반 위에서 관계, 일, 진로의 우선순위를 다시 조정하는 흐름이 좋습니다. 지금의 결과가 당신을 규정하는 것은 아니며, 현재의 마음과 생활 패턴을 이해하기 위한 지도에 가깝습니다. 지도를 보고 전부 바꾸려 하기보다, 오늘 가장 작은 한 가지부터 바꾸는 것이 실제 회복으로 이어질 가능성이 있습니다.`,
    ],
    playlists: [weakProfile.playlist, "감정정리 안정 플레이리스트", "잠들기 전 회복 플레이리스트", "불안 완화 호흡 플레이리스트", "아침 루틴 회복 플레이리스트"],
    songs: tracks.map((track) => track.title),
  };
}

function ScoreBar({ label, score, caution }: { label: string; score: number; caution: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-100">{label}</span>
        <span className={caution ? "font-black text-rose-200" : "font-black text-sky-200"}>{score}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${caution ? "bg-rose-300" : "bg-sky-300"}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function RadarChart({ scores }: { scores: Record<PsychologyScoreKey, number> }) {
  const keys = Object.keys(scoreLabels) as PsychologyScoreKey[];
  const center = 120;
  const radius = 86;
  const points = keys.map((key, index) => {
    const angle = (Math.PI * 2 * index) / keys.length - Math.PI / 2;
    const distance = (scores[key] / 100) * radius;
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 240 240" className="mx-auto aspect-square w-full max-w-[18rem]" role="img" aria-label="심리 결과 레이더 차트">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <circle key={scale} cx={center} cy={center} r={radius * scale} fill="none" stroke="rgba(255,255,255,0.14)" />
      ))}
      {keys.map((key, index) => {
        const angle = (Math.PI * 2 * index) / keys.length - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        const labelX = center + Math.cos(angle) * (radius + 22);
        const labelY = center + Math.sin(angle) * (radius + 22);
        return (
          <g key={key}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" />
            <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className="fill-slate-300 text-[10px] font-bold">
              {scoreLabels[key]}
            </text>
          </g>
        );
      })}
      <polygon points={points} fill="rgba(125,211,252,0.28)" stroke="#7dd3fc" strokeWidth="3" />
    </svg>
  );
}

function ElementBars({ counts }: { counts: Record<ElementKey, number> }) {
  const max = Math.max(...Object.values(counts), 1);
  return (
    <div className="grid gap-3">
      {elementNames.map((element) => (
        <div key={element}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-bold text-white">{element}</span>
            <span className="text-slate-300">{counts[element]}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-pink-300" style={{ width: `${Math.max(8, (counts[element] / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(date: Date, separator: "." | "" = ".") {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return separator === "." ? `${year}.${month}.${day}` : `${year}${month}${day}`;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function downloadPdf(result: CombinedStoredResult, report: FullReport, token: string | null) {
  if (!isReportUnlocked(token)) return;
  const created = formatDate(new Date(result.createdAt));
  const rows = Object.entries(result.psychology.scores)
    .map(([key, score]) => `<tr><td>${escapeHtml(scoreLabels[key as PsychologyScoreKey])}</td><td>${score}</td></tr>`)
    .join("");
  const graphBars = Object.entries(result.psychology.scores)
    .map(([key, score]) => `<div class="bar-row"><span>${escapeHtml(scoreLabels[key as PsychologyScoreKey])}</span><div class="bar"><i style="width:${score}%"></i></div><b>${score}</b></div>`)
    .join("");
  const psychologyReport = [
    ["현재 마음 상태", report.mentalState],
    ["감정 패턴 분석", report.emotionalPattern],
    ["사고 패턴 분석", report.thoughtPattern],
    ["스트레스 원인 추정", report.stressCause],
    ["불안 원인 추정", report.anxietyCause],
    ["에너지 상태 분석", report.energyState],
    ["자존감 분석", report.selfEsteemAnalysis],
    ["대인관계 성향 분석", report.relationshipAnalysis],
    ["사회성 분석", report.socialityAnalysis],
    ["직업 성향 분석", report.careerAnalysis],
    ["번아웃 위험도", report.burnoutRisk],
    ["현재 가장 필요한 회복 요소", report.recoveryNeed],
    ["앞으로 1개월 관리 팁", report.oneMonthTips],
    ["앞으로 3개월 관리 팁", report.threeMonthTips],
  ].map(([title, body]) => `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>`).join("");
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>SimSimPlay-종합리포트-${formatDate(new Date(), "")}</title><style>body{font-family:Arial,'Malgun Gothic',sans-serif;line-height:1.75;color:#111;padding:40px}h1,h2{page-break-after:avoid}h3{margin-top:18px;margin-bottom:4px}table{border-collapse:collapse;width:100%;margin:12px 0}td{border:1px solid #ddd;padding:8px}.cover{min-height:55vh;display:flex;flex-direction:column;justify-content:center}.note{color:#555;font-size:13px}.bar-row{display:grid;grid-template-columns:110px 1fr 38px;gap:10px;align-items:center;margin:8px 0}.bar{height:12px;background:#eee;border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:#38bdf8}.section{page-break-inside:avoid}</style></head><body><section class="cover"><h1>SimSimPlay 종합 리포트</h1><p>생성일 ${created}</p></section><h2>심리 점수</h2><table>${rows}</table><h2>그래프</h2>${graphBars}<h2>심리 리포트</h2>${psychologyReport}<h3>현재 피해야 할 행동</h3><ul>${report.avoidActions.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><h3>감정일기 추천 질문 5개</h3><ul>${report.journalQuestions.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><h2>사주 리포트</h2><p>원국: ${result.saju.year}년 ${result.saju.month}월 ${result.saju.day}일 ${result.saju.hour}시</p><p>목화토금수 오행 개수: ${elementNames.map((element) => `${element} ${result.elementCounts[element]}`).join(", ")}</p><p>강한 오행: ${result.dominantElement}, 부족한 오행: ${result.weakElement}</p><p>타고난 성향: ${escapeHtml(report.sajuNature)}</p><p>대운 흐름: ${escapeHtml(report.daewoonFlow)}</p><p>오늘의 운세 점수: ${result.todayFortuneScore}</p><p>오늘의 회복 루틴: ${report.recoveryRoutine.map(escapeHtml).join(", ")}</p><p>조심해야 할 점: ${report.sajuCautions.map(escapeHtml).join(" ")}</p><p>활용하면 좋은 기운: ${escapeHtml(report.usefulEnergy)}</p><h2>종합 해석</h2>${report.combinedInterpretation.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}<h2>추천 행동</h2><ul>${report.recommendedActions.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><h2>추천 플레이리스트</h2><ul>${report.playlists.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><h2>추천 음악</h2><ul>${report.songs.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul><p class="note">본 결과는 자기이해와 감정정리를 돕기 위한 참고용 콘텐츠이며, 의학적 진단이나 치료를 대체하지 않습니다. 사주 및 운세 해석은 전통 명리학 기반의 참고용 콘텐츠입니다.</p><script>document.title='SimSimPlay-종합리포트-${formatDate(new Date(), "")}.pdf';window.print();</script></body></html>`;
  const popup = window.open("", "_blank", "width=900,height=1200");
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

export function PsychologyResultClient() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CombinedStoredResult | null>(null);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = readJson<CombinedStoredResult | null>(resultKey, null);
    const built = saved ?? buildStoredResult();
    if (built) {
      setResult(built);
      window.sessionStorage.setItem(resultKey, JSON.stringify(built));
    }
  }, []);

  const hasUtm = Boolean(searchParams.get("utm"));
  const unlocked = isReportUnlocked(unlockToken);
  const fullReport = useMemo(() => (result && unlocked ? getFullReport(result) : null), [result, unlocked]);
  const preview = useMemo(() => (result ? getPreviewReport(result) : []), [result]);

  if (!result) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-slate-300">
        저장된 심리상담 Q&A 결과가 없습니다. <Link className="font-bold text-sky-200" href="/psychology">처음부터 다시 시작하기</Link>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 sm:p-7">
        <p className="text-sm font-bold text-sky-200">무료 3줄 요약</p>
        <ol className="mt-4 grid gap-3 text-base leading-7 text-white">
          {preview.map((line, index) => (
            <li key={line} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
              <span className="font-black text-pink-200">{index + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>

      {!unlocked ? (
        <div className="space-y-5">
          <section className="rounded-3xl border border-pink-300/30 bg-pink-300/10 p-5 shadow-2xl shadow-pink-950/20 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-center">
              <div>
                <h2 className="text-2xl font-black text-white">전체 심리상담 + 사주 리포트 보기</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  심리테스트 결과, 사주 성향 분석, 오늘의 회복 루틴, 추천 플레이리스트를 모두 확인할 수 있습니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-100">
                  {["심리분석 결과", "사주풀이 결과", "회복 루틴", "추천 음악", "PDF 저장"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-2">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:text-right">
                <p className="text-sm font-bold text-slate-400">정가 2,990원</p>
                <p className="mt-1 text-3xl font-black text-pink-100">{hasUtm ? "오늘만 990원" : "2,990원"}</p>
                <button
                  type="button"
                  onClick={() => setUnlockToken(handlePaymentClick())}
                  className="mt-4 w-full rounded-full bg-white px-5 py-4 text-sm font-black text-slate-950 lg:w-auto"
                >
                  결제하고 전체 페이지 보기
                </button>
                <p className="mt-2 text-xs font-bold text-slate-400">현재 버튼은 개발용 임시 잠금 해제만 수행합니다.</p>
              </div>
            </div>
          </section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="space-y-4" aria-hidden="true">
              <div className="h-6 w-2/3 rounded-full bg-white/10" />
              <div className="h-28 rounded-2xl bg-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-36 rounded-2xl bg-white/10" />
                <div className="h-36 rounded-2xl bg-white/10" />
              </div>
              <div className="h-44 rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      ) : null}

      {unlocked && fullReport ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-300">잠금 해제된 전체 리포트</p>
            <button
              type="button"
              onClick={() => downloadPdf(result, fullReport, unlockToken)}
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              PDF로 저장하기
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
              <h2 className="text-2xl font-black text-white">심리테스트 결과</h2>
              <div className="mt-5 grid gap-4">
                {(Object.keys(scoreLabels) as PsychologyScoreKey[]).map((key) => (
                  <ScoreBar key={key} label={`${scoreLabels[key]} · ${result.psychology.levels[key]}`} score={result.psychology.scores[key]} caution={cautionKeys.includes(key)} />
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
              <h2 className="text-2xl font-black text-white">그래프</h2>
              <RadarChart scores={result.psychology.scores} />
            </section>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">심리 리포트</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ReportBlock title="현재 마음 상태" body={fullReport.mentalState} />
              <ReportBlock title="감정 패턴 분석" body={fullReport.emotionalPattern} />
              <ReportBlock title="사고 패턴 분석" body={fullReport.thoughtPattern} />
              <ReportBlock title="스트레스 원인 추정" body={fullReport.stressCause} />
              <ReportBlock title="불안 원인 추정" body={fullReport.anxietyCause} />
              <ReportBlock title="에너지 상태 분석" body={fullReport.energyState} />
              <ReportBlock title="자존감 분석" body={fullReport.selfEsteemAnalysis} />
              <ReportBlock title="대인관계 성향 분석" body={fullReport.relationshipAnalysis} />
              <ReportBlock title="사회성 분석" body={fullReport.socialityAnalysis} />
              <ReportBlock title="직업 성향 분석" body={fullReport.careerAnalysis} />
              <ReportBlock title="번아웃 위험도" body={fullReport.burnoutRisk} />
              <ReportBlock title="현재 가장 필요한 회복 요소" body={fullReport.recoveryNeed} />
              <ReportBlock title="현재 피해야 할 행동" body={fullReport.avoidActions.join(" / ")} />
              <ReportBlock title="앞으로 1개월 관리 팁" body={fullReport.oneMonthTips} />
              <ReportBlock title="앞으로 3개월 관리 팁" body={fullReport.threeMonthTips} />
              <ReportBlock title="감정일기 추천 질문 5개" body={fullReport.journalQuestions.join(" ")} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">사주 리포트</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="grid gap-4 md:grid-cols-2">
                <ReportBlock title="사주 원국" body={`${result.saju.year}년 ${result.saju.month}월 ${result.saju.day}일 ${result.saju.hour}시`} />
                <ReportBlock title="타고난 성향" body={fullReport.sajuNature} />
                <ReportBlock title="강한 오행" body={result.dominantElement} />
                <ReportBlock title="부족한 오행" body={result.weakElement} />
                <ReportBlock title="대운 흐름" body={fullReport.daewoonFlow} />
                <ReportBlock title="오늘의 운세 점수" body={`${result.todayFortuneScore}점`} />
                <ReportBlock title="오늘의 회복 루틴" body={fullReport.recoveryRoutine.join(" / ")} />
                <ReportBlock title="조심해야 할 점" body={fullReport.sajuCautions.join(" ")} />
                <ReportBlock title="활용하면 좋은 기운" body={fullReport.usefulEnergy} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-4 text-sm font-black text-white">목화토금수 오행 개수</p>
                <ElementBars counts={result.elementCounts} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">종합 해석</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-300">
              {fullReport.combinedInterpretation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Recommendation title="추천 행동 5개" items={fullReport.recommendedActions} />
            <Recommendation title="추천 플레이리스트 5개" items={fullReport.playlists} />
            <Recommendation title="추천 음악 5곡" items={fullReport.songs} />
          </section>
        </div>
      ) : null}

      <footer className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-400">
        <p>본 결과는 자기이해와 감정정리를 돕기 위한 참고용 콘텐츠이며, 의학적 진단이나 치료를 대체하지 않습니다.</p>
        <p className="mt-2">사주 및 운세 해석은 전통 명리학 기반의 참고용 콘텐츠입니다.</p>
      </footer>
    </section>
  );
}

function ReportBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-black text-sky-200">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </article>
  );
}

function Recommendation({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3">{item}</li>
        ))}
      </ul>
    </section>
  );
}
